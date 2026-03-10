#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
First-time deploy script for Organ & Blood System.

Usage:
    python deploy.py

You will be prompted for:
  - Hugging Face username + token
  - Netlify personal access token
  - (optional) preferred names for HF Space and Netlify site

After this script runs (~3-5 min) both services will be live and
subsequent deployments happen automatically via GitHub Actions on every `git push`.

Requirements:
    pip install huggingface_hub requests
    npx netlify-cli (auto-installed via npx)
"""

import os
import secrets
import string
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
BACKEND_DIR = ROOT / "backend_django"
FRONTEND_DIR = ROOT / "web_react"

# Force UTF-8 output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def load_env_deploy():
    """Load .env.deploy if it exists, return dict of values."""
    env_file = ROOT / ".env.deploy"
    values = {}
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and "=" in line and not line.startswith("#"):
                key, _, val = line.partition("=")
                values[key.strip()] = val.strip()
    return values


# -- Helpers -------------------------------------------------------------------

def run(cmd, cwd=None, env=None, check=True):
    print(f"  $ {cmd}")
    merged_env = {**os.environ, **(env or {})}
    result = subprocess.run(cmd, shell=True, cwd=cwd, env=merged_env, capture_output=False)
    if check and result.returncode != 0:
        print(f"ERROR: command failed (exit {result.returncode})")
        sys.exit(1)
    return result

def ask(prompt, default=None):
    suffix = f" [{default}]" if default else ""
    value = input(f"{prompt}{suffix}: ").strip()
    return value or default

def generate_secret_key(length=50):
    chars = string.ascii_letters + string.digits + "!@#$%^&*(-_=+)"
    return "".join(secrets.choice(chars) for _ in range(length))

def install_pip(package):
    run(f"{sys.executable} -m pip install {package} -q")

def hf_space_url(username, space_name):
    u = username.lower().replace("_", "-")
    s = space_name.lower().replace("_", "-")
    return f"https://{u}-{s}.hf.space"


# -- Step 1: Collect credentials -----------------------------------------------

def collect_credentials():
    print("\n" + "="*60)
    print("  ORGAN & BLOOD SYSTEM -- DEPLOY SETUP")
    print("="*60)

    saved = load_env_deploy()

    hf_username   = saved.get("HF_USERNAME", "").strip()
    hf_token      = saved.get("HF_TOKEN", "").strip()
    hf_space      = saved.get("HF_SPACE_NAME", "organ-blood-backend").strip() or "organ-blood-backend"
    netlify_token = saved.get("NETLIFY_TOKEN", "").strip()
    netlify_site  = saved.get("NETLIFY_SITE_NAME", "").strip()

    required = {"HF_USERNAME": hf_username, "HF_TOKEN": hf_token, "NETLIFY_TOKEN": netlify_token}
    missing = [k for k, v in required.items() if not v]

    if not missing:
        print(f"\n  [.env.deploy] All credentials loaded -- skipping prompts")
        print(f"  HF User  : {hf_username}")
        print(f"  HF Space : {hf_space}")
        print(f"  HF Token : {hf_token[:8]}...")
        print(f"  Netlify  : {netlify_token[:8]}...")
    else:
        print("\nYou need:")
        print("  * Hugging Face account  ->  huggingface.co/settings/tokens")
        print("  * Netlify account       ->  app.netlify.com/user/applications")
        print()
        if not hf_username:   hf_username   = ask("Hugging Face username (e.g. SakthiMahendran)")
        if not hf_token:      hf_token      = ask("Hugging Face access token (write permission required)")
        if not hf_space:      hf_space      = ask("HF Space name", default="organ-blood-backend")
        print()
        if not netlify_token: netlify_token = ask("Netlify personal access token")
        if not netlify_site:  netlify_site  = ask("Netlify site name (leave blank for auto)", default="")

    django_key = generate_secret_key()
    print(f"\n[auto] Generated Django SECRET_KEY")

    # Persist filled values back to .env.deploy for future runs
    env_file = ROOT / ".env.deploy"
    env_file.write_text(
        f"HF_TOKEN={hf_token}\n"
        f"HF_USERNAME={hf_username}\n"
        f"HF_SPACE_NAME={hf_space}\n"
        f"NETLIFY_TOKEN={netlify_token}\n"
        f"NETLIFY_SITE_NAME={netlify_site}\n",
        encoding="utf-8",
    )
    print("[auto] Saved credentials to .env.deploy for future runs")

    return {
        "hf_username":    hf_username,
        "hf_token":       hf_token,
        "hf_space":       hf_space,
        "netlify_token":  netlify_token,
        "netlify_site":   netlify_site,
        "django_key":     django_key,
    }


# -- Step 2: Deploy backend to HF Spaces ---------------------------------------

def deploy_backend(cfg):
    print("\n[1/4] Deploying backend to Hugging Face Spaces...")
    install_pip("huggingface_hub")
    from huggingface_hub import HfApi

    api = HfApi(token=cfg["hf_token"])
    repo_id = f"{cfg['hf_username']}/{cfg['hf_space']}"

    print(f"  Creating/checking Space: {repo_id}")
    api.create_repo(
        repo_id=repo_id,
        repo_type="space",
        space_sdk="docker",
        private=False,
        exist_ok=True,
    )

    print("  Uploading backend_django/ ...")
    api.upload_folder(
        folder_path=str(BACKEND_DIR),
        repo_id=repo_id,
        repo_type="space",
        ignore_patterns=[
            ".venv", ".venv/**",
            "__pycache__", "**/__pycache__/**", "**/__pycache__",
            "*.pyc", "**/*.pyc",
            "db.sqlite3", "*.sqlite3",
            "staticfiles", "staticfiles/**",
            ".env", "**/.env",
        ],
        commit_message="Initial deploy via deploy.py",
    )

    space_url = hf_space_url(cfg["hf_username"], cfg["hf_space"])
    print(f"  Setting Space environment secrets...")
    for key, value in {
        "DJANGO_SECRET_KEY":             cfg["django_key"],
        "DJANGO_DEBUG":                  "False",
        "SQLITE_PATH":                   "/data/db.sqlite3",
        "DJANGO_ALLOWED_HOSTS":          "*",
        "DJANGO_CORS_ALLOW_ALL_ORIGINS": "True",
    }.items():
        try:
            api.add_space_secret(repo_id=repo_id, key=key, value=value)
        except Exception as e:
            print(f"  Warning: could not set {key}: {e}")

    print(f"\n  [OK] Backend deploying at: {space_url}")
    print("  (HF Spaces takes 2-5 min to build Docker image on first deploy)")
    return space_url


# -- Step 3: Deploy frontend to Netlify ----------------------------------------

def deploy_frontend(cfg, backend_url):
    print("\n[2/4] Building React frontend...")
    run("npm ci", cwd=FRONTEND_DIR)
    run(
        "npm run build",
        cwd=FRONTEND_DIR,
        env={"VITE_API_BASE_URL": f"{backend_url}/api"},
    )

    print("\n[3/4] Deploying frontend to Netlify...")
    dist_dir = str(FRONTEND_DIR / "dist")

    # Create site + first deploy
    cmd = f'npx --yes netlify-cli deploy --prod --dir="{dist_dir}" --auth={cfg["netlify_token"]}'
    if cfg.get("netlify_site"):
        cmd += f' --name={cfg["netlify_site"]}'

    result = subprocess.run(cmd, shell=True, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print(result.stdout)
    if result.returncode != 0:
        print(result.stderr)
        sys.exit(1)

    # Extract site URL and site ID from output
    site_url  = ""
    site_id   = ""
    for line in result.stdout.splitlines():
        if "Website URL" in line or "Live URL" in line:
            site_url = line.split()[-1].strip()
        if "Site ID" in line:
            site_id = line.split()[-1].strip()

    print(f"  [OK] Frontend live at: {site_url}")
    return site_url, site_id


# -- Step 4: Update backend CORS with Netlify URL ------------------------------

def update_backend_cors(cfg, netlify_url):
    if not netlify_url:
        return
    print(f"\n[4/4] Updating HF Space CORS to allow {netlify_url}...")
    from huggingface_hub import HfApi
    api = HfApi(token=cfg["hf_token"])
    repo_id = f"{cfg['hf_username']}/{cfg['hf_space']}"
    try:
        api.add_space_secret(
            repo_id=repo_id,
            key="DJANGO_CORS_ALLOWED_ORIGINS",
            value=netlify_url,
        )
        api.add_space_secret(
            repo_id=repo_id,
            key="DJANGO_CORS_ALLOW_ALL_ORIGINS",
            value="False",
        )
        print("  [OK] CORS updated")
    except Exception as e:
        print(f"  Warning: {e}")


# -- Step 5: Print GitHub Secrets summary --------------------------------------

def print_github_summary(cfg, backend_url, netlify_url, site_id):
    print("\n" + "="*60)
    print("  DONE! Add these 7 secrets to GitHub -> Settings -> Secrets:")
    print("="*60)
    all_secrets = {
        "HF_TOKEN":           cfg["hf_token"],
        "HF_USERNAME":        cfg["hf_username"],
        "HF_SPACE_NAME":      cfg["hf_space"],
        "DJANGO_SECRET_KEY":  cfg["django_key"],
        "NETLIFY_AUTH_TOKEN": cfg["netlify_token"],
        "NETLIFY_SITE_ID":    site_id,
        "NETLIFY_SITE_URL":   netlify_url.replace("https://", "") if netlify_url else "",
    }
    for k, v in all_secrets.items():
        masked = v[:8] + "..." if len(v) > 10 else v
        print(f"  {k:<25} {masked}")

    print("\n  After adding secrets, every `git push` auto-deploys both services.")
    print()
    print(f"  Backend API  : {backend_url}/api")
    print(f"  Frontend App : {netlify_url}")
    print()
    print("  Demo login credentials:")
    print("    admin@demo.com    / Demo1234!  (Admin)")
    print("    donor@demo.com    / Demo1234!  (Donor)")
    print("    hospital@demo.com / Demo1234!  (Hospital)")
    print("    acceptor@demo.com / Demo1234!  (Acceptor)")
    print()
    print("  NOTE: HF Space may take 2-5 min to finish building the Docker image.")
    print("        The frontend will show API errors until the backend is live.")


# -- Main ----------------------------------------------------------------------

if __name__ == "__main__":
    cfg = collect_credentials()
    backend_url = deploy_backend(cfg)
    netlify_url, site_id = deploy_frontend(cfg, backend_url)
    update_backend_cors(cfg, netlify_url)
    print_github_summary(cfg, backend_url, netlify_url, site_id)

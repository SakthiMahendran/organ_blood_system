try:
    import pymysql

    pymysql.install_as_MySQLdb()
except ImportError:
    # SQLite/local setups do not require the PyMySQL adapter.
    pass

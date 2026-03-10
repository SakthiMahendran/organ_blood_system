from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts_app.permissions import IsRecipient
from .models import RecipientProfile
from .serializers import RecipientProfileSerializer

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsRecipient])
def my_recipient_profile(request):
    if request.method == "GET":
        profile = RecipientProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Recipient profile not created yet."}, status=status.HTTP_404_NOT_FOUND)
        return Response(RecipientProfileSerializer(profile).data)

    serializer = RecipientProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated, IsRecipient])
def update_my_recipient_profile(request):
    profile = RecipientProfile.objects.filter(user=request.user).first()
    if not profile:
        return Response({"detail": "Create profile first."}, status=status.HTTP_404_NOT_FOUND)

    serializer = RecipientProfileSerializer(profile, data=request.data, partial=(request.method == "PATCH"))
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
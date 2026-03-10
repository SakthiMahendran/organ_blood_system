import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/app_notification.dart';
import '../../core/models/request_item.dart';
import '../../features/acceptor/data/models/donor_search_item.dart';
import '../../features/admin/data/models/admin_hospital_item.dart';
import '../../features/admin/data/models/admin_summary.dart';
import '../../features/admin/data/models/admin_user_item.dart';
import '../../features/admin/data/models/audit_log_item.dart';
import '../../features/analytics/data/models/analytics_snapshot.dart';
import '../../features/blood_detection/data/models/blood_detection_result.dart';
import '../../features/donor/data/models/donor_profile.dart';
import '../../features/donor/data/models/match_item.dart';
import '../../features/hospital/data/models/verification_item.dart';
import '../../features/inventory/data/models/inventory_item.dart';
import '../../features/matching/data/models/match_candidate.dart';

class DemoStore {
  DemoStore() {
    reset();
  }

  late DonorProfile _donorProfile;
  late List<MatchItem> _matches;
  late List<RequestItem> _requests;
  late List<DonorSearchItem> _searchDonors;
  late List<VerificationItem> _pendingVerifications;
  late List<AdminUserItem> _adminUsers;
  late List<AdminHospitalItem> _adminHospitals;
  late List<AuditLogItem> _auditLogs;
  late List<AppNotification> _notifications;
  late List<InventoryItem> _inventory;

  int _requestCounter = 500;
  int _auditCounter = 1000;
  int _notificationCounter = 2000;

  String _now() => DateTime.now().toIso8601String();

  void reset() {
    final now = _now();

    _donorProfile = DonorProfile(
      id: 101,
      bloodGroup: 'O+',
      organWilling: true,
      organTypes: const ['Kidney', 'Liver'],
      lastBloodDonationDate: DateTime.now()
          .subtract(const Duration(days: 120))
          .toIso8601String()
          .split('T')
          .first,
      availabilityStatus: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      medicalNotes: 'Healthy donor, non-smoker.',
      city: 'Pune',
      state: 'Maharashtra',
      updatedAt: now,
    );

    _matches = [
      MatchItem(
        id: 1,
        requestId: 300,
        donorEmail: 'donor.demo@example.com',
        matchScore: 89.5,
        donorResponse: 'PENDING',
        createdAt: now,
      ),
      MatchItem(
        id: 2,
        requestId: 301,
        donorEmail: 'donor.demo@example.com',
        matchScore: 81.2,
        donorResponse: 'ACCEPTED',
        createdAt: now,
      ),
    ];

    _requests = [
      RequestItem(
        id: 300,
        requestType: 'BLOOD',
        bloodGroup: 'O+',
        organType: null,
        unitsNeeded: 2,
        requiredDate: DateTime.now()
            .add(const Duration(days: 2))
            .toIso8601String()
            .split('T')
            .first,
        urgency: 'HIGH',
        city: 'Pune',
        state: 'Maharashtra',
        hospital: 1,
        status: 'MATCHED',
        notes: 'ICU patient requirement',
        createdAt: now,
        updatedAt: now,
      ),
      RequestItem(
        id: 301,
        requestType: 'ORGAN',
        bloodGroup: null,
        organType: 'Kidney',
        unitsNeeded: null,
        requiredDate: DateTime.now()
            .add(const Duration(days: 5))
            .toIso8601String()
            .split('T')
            .first,
        urgency: 'CRITICAL',
        city: 'Mumbai',
        state: 'Maharashtra',
        hospital: 1,
        status: 'APPROVED',
        notes: 'Immediate transplant support',
        createdAt: now,
        updatedAt: now,
      ),
      RequestItem(
        id: 302,
        requestType: 'BLOOD',
        bloodGroup: 'A-',
        organType: null,
        unitsNeeded: 1,
        requiredDate: DateTime.now()
            .add(const Duration(days: 1))
            .toIso8601String()
            .split('T')
            .first,
        urgency: 'EMERGENCY',
        city: 'Nashik',
        state: 'Maharashtra',
        hospital: 2,
        status: 'EMERGENCY',
        notes: 'Accident case in trauma unit',
        createdAt: now,
        updatedAt: now,
      ),
    ];

    _searchDonors = [
      DonorSearchItem(
        id: 11,
        userId: 111,
        name: 'Aarav Patil',
        bloodGroup: 'O+',
        organWilling: true,
        organTypes: const ['Kidney'],
        city: 'Pune',
        state: 'Maharashtra',
        verificationStatus: 'VERIFIED',
        availabilityStatus: 'AVAILABLE',
        compatibilityScore: 92.3,
        confidence: 88.0,
        urgency: 'HIGH',
      ),
      DonorSearchItem(
        id: 12,
        userId: 112,
        name: 'Riya Sharma',
        bloodGroup: 'A+',
        organWilling: false,
        organTypes: const [],
        city: 'Mumbai',
        state: 'Maharashtra',
        verificationStatus: 'VERIFIED',
        availabilityStatus: 'AVAILABLE',
        compatibilityScore: 76.5,
        confidence: 72.1,
        urgency: 'MEDIUM',
      ),
      DonorSearchItem(
        id: 13,
        userId: 113,
        name: 'Karan Joshi',
        bloodGroup: 'B-',
        organWilling: true,
        organTypes: const ['Liver', 'Cornea'],
        city: 'Nashik',
        state: 'Maharashtra',
        verificationStatus: 'VERIFIED',
        availabilityStatus: 'NOT_AVAILABLE',
        compatibilityScore: 68.9,
        confidence: 63.4,
        urgency: 'CRITICAL',
      ),
    ];

    _pendingVerifications = [
      VerificationItem(
        id: 201,
        userId: 901,
        donorName: 'Neha Kulkarni',
        bloodGroup: 'B+',
        organWilling: true,
        city: 'Pune',
        verificationStatus: 'PENDING',
      ),
      VerificationItem(
        id: 202,
        userId: 902,
        donorName: 'Rahul Das',
        bloodGroup: 'AB+',
        organWilling: false,
        city: 'Nashik',
        verificationStatus: 'PENDING',
      ),
    ];

    _adminUsers = [
      AdminUserItem(
        id: 1,
        username: 'demo_admin',
        email: 'admin.demo@example.com',
        phone: '9876543210',
        userType: 'ADMIN',
        isActive: true,
        createdAt: now,
      ),
      AdminUserItem(
        id: 2,
        username: 'demo_donor',
        email: 'donor.demo@example.com',
        phone: '9876500001',
        userType: 'DONOR',
        isActive: true,
        createdAt: now,
      ),
      AdminUserItem(
        id: 3,
        username: 'demo_acceptor',
        email: 'acceptor.demo@example.com',
        phone: '9876500002',
        userType: 'ACCEPTOR',
        isActive: true,
        createdAt: now,
      ),
    ];

    _adminHospitals = [
      AdminHospitalItem(
        id: 1,
        name: 'City Care Hospital',
        licenseId: 'LIC-CC-001',
        city: 'Pune',
        state: 'Maharashtra',
        approvalStatus: 'APPROVED',
        createdAt: now,
      ),
      AdminHospitalItem(
        id: 2,
        name: 'Metro Health Center',
        licenseId: 'LIC-MH-002',
        city: 'Mumbai',
        state: 'Maharashtra',
        approvalStatus: 'PENDING',
        createdAt: now,
      ),
    ];

    _auditLogs = [
      AuditLogItem(
        id: 1001,
        actorEmail: 'admin.demo@example.com',
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: 2,
        createdAt: now,
      ),
      AuditLogItem(
        id: 1002,
        actorEmail: 'hospital.demo@example.com',
        action: 'DONOR_VERIFICATION_UPDATED',
        entityType: 'DonorProfile',
        entityId: 201,
        createdAt: now,
      ),
    ];

    _notifications = [
      AppNotification(
        id: 1,
        title: 'New donation match',
        message: 'A blood request matches your profile.',
        type: 'MATCH_ALERT',
        isRead: false,
        createdAt: now,
      ),
      AppNotification(
        id: 2,
        title: 'Request status updated',
        message: 'Your request #301 is APPROVED.',
        type: 'REQUEST_UPDATE',
        isRead: true,
        createdAt: now,
      ),
      AppNotification(
        id: 3,
        title: 'Emergency request nearby',
        message: 'Critical request reported in Nashik.',
        type: 'EMERGENCY_ALERT',
        isRead: false,
        createdAt: now,
      ),
    ];

    _inventory = [
      InventoryItem(bloodGroup: 'A+', units: 8, threshold: 6, updatedAt: now),
      InventoryItem(bloodGroup: 'A-', units: 5, threshold: 4, updatedAt: now),
      InventoryItem(bloodGroup: 'B+', units: 10, threshold: 6, updatedAt: now),
      InventoryItem(bloodGroup: 'B-', units: 4, threshold: 5, updatedAt: now),
      InventoryItem(bloodGroup: 'AB+', units: 3, threshold: 3, updatedAt: now),
      InventoryItem(bloodGroup: 'AB-', units: 2, threshold: 3, updatedAt: now),
      InventoryItem(bloodGroup: 'O+', units: 12, threshold: 7, updatedAt: now),
      InventoryItem(bloodGroup: 'O-', units: 3, threshold: 5, updatedAt: now),
    ];
  }

  DonorProfile getDonorProfile() => _donorProfile;

  DonorProfile upsertDonorProfile(Map<String, dynamic> payload) {
    _donorProfile = DonorProfile(
      id: _donorProfile.id,
      bloodGroup:
          (payload['blood_group'] ?? _donorProfile.bloodGroup).toString(),
      organWilling: payload['organ_willing'] == true,
      organTypes: (payload['organ_types'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(growable: false),
      lastBloodDonationDate: payload['last_blood_donation_date']?.toString(),
      availabilityStatus: _donorProfile.availabilityStatus,
      verificationStatus: _donorProfile.verificationStatus,
      medicalNotes: payload['medical_notes']?.toString(),
      city: (payload['city'] ?? _donorProfile.city).toString(),
      state: (payload['state'] ?? _donorProfile.state).toString(),
      updatedAt: _now(),
    );
    return _donorProfile;
  }

  DonorProfile updateDonorAvailability(String availabilityStatus) {
    _donorProfile = DonorProfile(
      id: _donorProfile.id,
      bloodGroup: _donorProfile.bloodGroup,
      organWilling: _donorProfile.organWilling,
      organTypes: _donorProfile.organTypes,
      lastBloodDonationDate: _donorProfile.lastBloodDonationDate,
      availabilityStatus: availabilityStatus,
      verificationStatus: _donorProfile.verificationStatus,
      medicalNotes: _donorProfile.medicalNotes,
      city: _donorProfile.city,
      state: _donorProfile.state,
      updatedAt: _now(),
    );
    return _donorProfile;
  }

  List<MatchItem> getDonorMatches() => List<MatchItem>.from(_matches);

  void respondToMatch(int matchId, String response) {
    _matches = _matches
        .map((item) => item.id == matchId
            ? MatchItem(
                id: item.id,
                requestId: item.requestId,
                donorEmail: item.donorEmail,
                matchScore: item.matchScore,
                donorResponse: response,
                createdAt: item.createdAt,
              )
            : item)
        .toList(growable: false);

    _auditLogs = [
      AuditLogItem(
        id: ++_auditCounter,
        actorEmail: 'donor.demo@example.com',
        action: 'MATCH_RESPONSE_SUBMITTED',
        entityType: 'Match',
        entityId: matchId,
        createdAt: _now(),
      ),
      ..._auditLogs,
    ];
  }

  List<RequestItem> getAcceptorRequests() => List<RequestItem>.from(_requests);

  RequestItem createBloodRequest(Map<String, dynamic> payload) {
    final urgency = (payload['urgency'] ?? 'MEDIUM').toString();
    final status = urgency == 'EMERGENCY' ? 'EMERGENCY' : 'SUBMITTED';

    final item = RequestItem(
      id: ++_requestCounter,
      requestType: 'BLOOD',
      bloodGroup: payload['blood_group']?.toString(),
      organType: null,
      unitsNeeded: (payload['units_needed'] as num?)?.toInt(),
      requiredDate: payload['required_date']?.toString(),
      urgency: urgency,
      city: (payload['city'] ?? '').toString(),
      state: (payload['state'] ?? '').toString(),
      hospital: 1,
      status: status,
      notes: payload['notes']?.toString(),
      createdAt: _now(),
      updatedAt: _now(),
    );
    _requests = [item, ..._requests];
    return item;
  }

  RequestItem createOrganRequest(Map<String, dynamic> payload) {
    final urgency = (payload['urgency'] ?? 'MEDIUM').toString();
    final status = urgency == 'EMERGENCY' ? 'EMERGENCY' : 'SUBMITTED';

    final item = RequestItem(
      id: ++_requestCounter,
      requestType: 'ORGAN',
      bloodGroup: null,
      organType: payload['organ_type']?.toString(),
      unitsNeeded: null,
      requiredDate: payload['required_date']?.toString(),
      urgency: urgency,
      city: (payload['city'] ?? '').toString(),
      state: (payload['state'] ?? '').toString(),
      hospital: 1,
      status: status,
      notes: payload['notes']?.toString(),
      createdAt: _now(),
      updatedAt: _now(),
    );
    _requests = [item, ..._requests];
    return item;
  }

  RequestItem? getRequestById(int requestId) {
    for (final item in _requests) {
      if (item.id == requestId) {
        return item;
      }
    }
    return null;
  }

  RequestItem updateRequest(int requestId, Map<String, dynamic> payload) {
    final old = getRequestById(requestId)!;
    final updated = RequestItem(
      id: old.id,
      requestType: old.requestType,
      bloodGroup: payload.containsKey('blood_group')
          ? payload['blood_group']?.toString()
          : old.bloodGroup,
      organType: payload.containsKey('organ_type')
          ? payload['organ_type']?.toString()
          : old.organType,
      unitsNeeded: payload.containsKey('units_needed')
          ? (payload['units_needed'] as num?)?.toInt()
          : old.unitsNeeded,
      requiredDate: payload.containsKey('required_date')
          ? payload['required_date']?.toString()
          : old.requiredDate,
      urgency: payload.containsKey('urgency')
          ? payload['urgency'].toString()
          : old.urgency,
      city: payload.containsKey('city') ? payload['city'].toString() : old.city,
      state: payload.containsKey('state')
          ? payload['state'].toString()
          : old.state,
      hospital: old.hospital,
      status: old.status,
      notes: payload.containsKey('notes')
          ? payload['notes']?.toString()
          : old.notes,
      createdAt: old.createdAt,
      updatedAt: _now(),
    );

    _requests = _requests
        .map((item) => item.id == requestId ? updated : item)
        .toList(growable: false);
    return updated;
  }

  RequestItem cancelRequest(int requestId) {
    final old = getRequestById(requestId)!;
    final updated = RequestItem(
      id: old.id,
      requestType: old.requestType,
      bloodGroup: old.bloodGroup,
      organType: old.organType,
      unitsNeeded: old.unitsNeeded,
      requiredDate: old.requiredDate,
      urgency: old.urgency,
      city: old.city,
      state: old.state,
      hospital: old.hospital,
      status: 'CANCELLED',
      notes: old.notes,
      createdAt: old.createdAt,
      updatedAt: _now(),
    );
    _requests = _requests
        .map((item) => item.id == requestId ? updated : item)
        .toList(growable: false);
    return updated;
  }

  List<DonorSearchItem> searchDonors({
    required String type,
    String? bloodGroup,
    String? organ,
    String? city,
    String? state,
    bool onlyAvailable = false,
    String? urgency,
  }) {
    return _searchDonors.where((donor) {
      if (city != null &&
          city.isNotEmpty &&
          donor.city.toLowerCase() != city.toLowerCase()) {
        return false;
      }
      if (state != null &&
          state.isNotEmpty &&
          donor.state.toLowerCase() != state.toLowerCase()) {
        return false;
      }
      if (onlyAvailable &&
          donor.availabilityStatus.toUpperCase() != 'AVAILABLE') {
        return false;
      }
      if (type == 'blood' &&
          bloodGroup != null &&
          bloodGroup.isNotEmpty &&
          donor.bloodGroup != bloodGroup) {
        return false;
      }
      if (type == 'organ' && organ != null && organ.isNotEmpty) {
        final hasOrgan = donor.organTypes
            .map((e) => e.toLowerCase())
            .contains(organ.toLowerCase());
        if (!hasOrgan) {
          return false;
        }
      }
      if (urgency != null && urgency.isNotEmpty && urgency != 'ALL') {
        if ((donor.urgency ?? '').toUpperCase() != urgency.toUpperCase()) {
          return false;
        }
      }
      return true;
    }).toList(growable: false);
  }

  List<RequestItem> getHospitalRequests() => List<RequestItem>.from(_requests);

  List<VerificationItem> getPendingVerifications() =>
      List<VerificationItem>.from(_pendingVerifications);

  void updateVerification(int donorId, String status) {
    _pendingVerifications = _pendingVerifications
        .where((item) => item.id != donorId)
        .toList(growable: false);
    _notifications = [
      AppNotification(
        id: ++_notificationCounter,
        title: 'Verification status updated',
        message: 'Donor verification changed to $status.',
        type: 'VERIFY_STATUS',
        isRead: false,
        createdAt: _now(),
      ),
      ..._notifications,
    ];
  }

  RequestItem updateHospitalRequestStatus(
      {required int requestId, required String status, String? notes}) {
    final old = getRequestById(requestId)!;
    final updated = RequestItem(
      id: old.id,
      requestType: old.requestType,
      bloodGroup: old.bloodGroup,
      organType: old.organType,
      unitsNeeded: old.unitsNeeded,
      requiredDate: old.requiredDate,
      urgency: old.urgency,
      city: old.city,
      state: old.state,
      hospital: old.hospital,
      status: status,
      notes: notes ?? old.notes,
      createdAt: old.createdAt,
      updatedAt: _now(),
    );
    _requests = _requests
        .map((item) => item.id == requestId ? updated : item)
        .toList(growable: false);
    return updated;
  }

  void runMatching(int requestId) {
    final old = getRequestById(requestId);
    if (old == null) return;

    final updated = RequestItem(
      id: old.id,
      requestType: old.requestType,
      bloodGroup: old.bloodGroup,
      organType: old.organType,
      unitsNeeded: old.unitsNeeded,
      requiredDate: old.requiredDate,
      urgency: old.urgency,
      city: old.city,
      state: old.state,
      hospital: old.hospital,
      status: 'MATCHED',
      notes: old.notes,
      createdAt: old.createdAt,
      updatedAt: _now(),
    );

    _requests = _requests
        .map((item) => item.id == requestId ? updated : item)
        .toList(growable: false);
    _notifications = [
      AppNotification(
        id: ++_notificationCounter,
        title: 'New matching run',
        message: 'Matching completed for request #$requestId',
        type: 'MATCH_ALERT',
        isRead: false,
        createdAt: _now(),
      ),
      ..._notifications,
    ];
  }

  AdminSummary getSummary() {
    final fulfilled =
        _requests.where((item) => item.status == 'FULFILLED').length;
    final active = _requests
        .where(
            (item) => item.status != 'FULFILLED' && item.status != 'CANCELLED')
        .length;
    final totalDonors =
        _adminUsers.where((user) => user.userType == 'DONOR').length;

    return AdminSummary(
      totalUsers: _adminUsers.length,
      totalDonors: totalDonors,
      verifiedDonors: 8,
      activeRequests: active,
      fulfilledRequests: fulfilled,
    );
  }

  List<AdminUserItem> getUsers() => List<AdminUserItem>.from(_adminUsers);

  void updateUserStatus({required int userId, required bool isActive}) {
    _adminUsers = _adminUsers
        .map((user) => user.id == userId
            ? AdminUserItem(
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                isActive: isActive,
                createdAt: user.createdAt,
              )
            : user)
        .toList(growable: false);
  }

  List<AdminHospitalItem> getHospitals() =>
      List<AdminHospitalItem>.from(_adminHospitals);

  void updateHospitalStatus(
      {required int hospitalId, required String approvalStatus}) {
    _adminHospitals = _adminHospitals
        .map((hospital) => hospital.id == hospitalId
            ? AdminHospitalItem(
                id: hospital.id,
                name: hospital.name,
                licenseId: hospital.licenseId,
                city: hospital.city,
                state: hospital.state,
                approvalStatus: approvalStatus,
                createdAt: hospital.createdAt,
              )
            : hospital)
        .toList(growable: false);
  }

  List<AuditLogItem> getAuditLogs({String? actorUserId, String? action}) {
    return _auditLogs.where((log) {
      if (action != null &&
          action.isNotEmpty &&
          !log.action.toLowerCase().contains(action.toLowerCase())) {
        return false;
      }
      if (actorUserId != null && actorUserId.isNotEmpty) {
        final id = int.tryParse(actorUserId);
        if (id != null && log.entityId != id) {
          return false;
        }
      }
      return true;
    }).toList(growable: false);
  }

  List<AppNotification> getNotifications() =>
      List<AppNotification>.from(_notifications);

  void markNotificationRead(int id) {
    _notifications = _notifications
        .map((item) => item.id == id
            ? AppNotification(
                id: item.id,
                title: item.title,
                message: item.message,
                type: item.type,
                isRead: true,
                createdAt: item.createdAt,
              )
            : item)
        .toList(growable: false);
  }

  List<MatchCandidate> getMatchingCandidates({
    required String role,
    required String type,
    String? bloodGroup,
    String? organType,
    String? city,
    String? state,
    String? urgency,
  }) {
    final candidates = _searchDonors.where((donor) {
      if (city != null &&
          city.isNotEmpty &&
          donor.city.toLowerCase() != city.toLowerCase()) {
        return false;
      }
      if (state != null &&
          state.isNotEmpty &&
          donor.state.toLowerCase() != state.toLowerCase()) {
        return false;
      }
      if (type == 'blood' &&
          bloodGroup != null &&
          bloodGroup.isNotEmpty &&
          donor.bloodGroup != bloodGroup) {
        return false;
      }
      if (type == 'organ' && organType != null && organType.isNotEmpty) {
        return donor.organTypes
            .map((e) => e.toLowerCase())
            .contains(organType.toLowerCase());
      }
      return true;
    }).toList(growable: false);

    return candidates
        .map(
          (donor) => MatchCandidate(
            id: donor.id,
            name: donor.name,
            requestType: type.toUpperCase(),
            bloodGroup: donor.bloodGroup,
            organType:
                donor.organTypes.isNotEmpty ? donor.organTypes.first : null,
            city: donor.city,
            state: donor.state,
            urgency: urgency == null || urgency == 'ALL'
                ? (donor.urgency ?? 'MEDIUM')
                : urgency,
            status: 'PENDING',
            availability: donor.availabilityStatus,
            compatibilityScore: donor.compatibilityScore ?? 70,
            confidence: donor.confidence ?? 65,
            explanations: const [
              'High compatibility',
              'Location aligned',
              'Urgent priority candidate'
            ],
          ),
        )
        .toList(growable: false);
  }

  String askChatbot(String question) {
    final q = question.toLowerCase();
    if (q.contains('eligibility')) {
      return 'Eligibility depends on age, hemoglobin, weight, and current health status. Consult your nearest certified center.';
    }
    if (q.contains('organ')) {
      return 'Organ donation requires medical screening, legal consent, and hospital verification workflow.';
    }
    if (q.contains('emergency')) {
      return 'Use Emergency Request for high-priority needs. Add location, urgency, and medical notes for faster triage.';
    }
    if (q.contains('matching')) {
      return 'Matching score combines blood/organ compatibility, urgency level, location proximity, and donor availability.';
    }
    return 'I can help with donation rules, emergency requests, matching, and medical workflow guidance.';
  }

  BloodDetectionResult detectBloodGroup({required String source}) {
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    final random = Random();
    final group = groups[random.nextInt(groups.length)];
    final confidence = 70 + random.nextDouble() * 25;

    return BloodDetectionResult(
      bloodGroup: group,
      confidence: confidence,
      summary: 'Prototype model inferred blood group from $source sample.',
      disclaimer:
          'Prototype demo output only. Confirm with certified lab testing.',
      inputType: 'text',
      sourceLabel: source,
    );
  }

  List<RequestItem> getEmergencyRequests({required String role}) {
    return _requests.where((item) {
      final urgency = item.urgency.toUpperCase();
      return urgency == 'EMERGENCY' ||
          urgency == 'CRITICAL' ||
          item.status.toUpperCase() == 'EMERGENCY';
    }).toList(growable: false);
  }

  RequestItem createEmergencyRequest(Map<String, dynamic> payload) {
    final type = (payload['request_type'] ?? 'BLOOD').toString().toUpperCase();
    final item = RequestItem(
      id: ++_requestCounter,
      requestType: type,
      bloodGroup: type == 'BLOOD' ? payload['blood_group']?.toString() : null,
      organType: type == 'ORGAN' ? payload['organ_type']?.toString() : null,
      unitsNeeded: type == 'BLOOD' ? 1 : null,
      requiredDate: DateTime.now().toIso8601String().split('T').first,
      urgency: 'EMERGENCY',
      city: (payload['city'] ?? '').toString(),
      state: (payload['state'] ?? '').toString(),
      hospital: 1,
      status: 'EMERGENCY',
      notes: payload['notes']?.toString(),
      createdAt: _now(),
      updatedAt: _now(),
    );

    _requests = [item, ..._requests];
    _notifications = [
      AppNotification(
        id: ++_notificationCounter,
        title: 'Emergency request created',
        message: 'Request #${item.id} marked as EMERGENCY.',
        type: 'EMERGENCY_ALERT',
        isRead: false,
        createdAt: _now(),
      ),
      ..._notifications,
    ];

    return item;
  }

  AnalyticsSnapshot getAnalyticsSnapshot() {
    final donors = _adminUsers
        .where((item) => item.userType.toUpperCase() == 'DONOR')
        .length;
    final recipients = _adminUsers
        .where((item) => item.userType.toUpperCase() == 'ACCEPTOR')
        .length;

    final requestsByStatus = <String, int>{};
    final bloodDistribution = <String, int>{};
    var emergencyCount = 0;

    for (final item in _requests) {
      final status = item.status.toUpperCase();
      requestsByStatus[status] = (requestsByStatus[status] ?? 0) + 1;

      if (item.bloodGroup != null && item.bloodGroup!.isNotEmpty) {
        bloodDistribution[item.bloodGroup!] =
            (bloodDistribution[item.bloodGroup!] ?? 0) + 1;
      }

      if (item.urgency.toUpperCase() == 'EMERGENCY' || status == 'EMERGENCY') {
        emergencyCount += 1;
      }
    }

    return AnalyticsSnapshot(
      totalDonors: donors,
      totalRecipients: recipients,
      totalRequests: _requests.length,
      emergencyRequests: emergencyCount,
      requestsByStatus: requestsByStatus,
      bloodGroupDistribution: bloodDistribution,
      emergencyTrend: const [2, 1, 3, 2, 4, 3, 5],
      donationActivity: const [5, 4, 6, 7, 8, 7, 9],
    );
  }

  List<InventoryItem> getInventory() => List<InventoryItem>.from(_inventory);

  InventoryItem updateInventory(
      {required String bloodGroup, required int units, int? threshold}) {
    final existing = _inventory.firstWhere(
      (item) => item.bloodGroup.toUpperCase() == bloodGroup.toUpperCase(),
      orElse: () => InventoryItem(
          bloodGroup: bloodGroup.toUpperCase(),
          units: 0,
          threshold: 5,
          updatedAt: _now()),
    );

    final updated = InventoryItem(
      bloodGroup: existing.bloodGroup,
      units: units,
      threshold: threshold ?? existing.threshold,
      updatedAt: _now(),
    );

    final hasExisting = _inventory.any(
        (item) => item.bloodGroup.toUpperCase() == bloodGroup.toUpperCase());
    if (hasExisting) {
      _inventory = _inventory
          .map((item) =>
              item.bloodGroup.toUpperCase() == bloodGroup.toUpperCase()
                  ? updated
                  : item)
          .toList(growable: false);
    } else {
      _inventory = [..._inventory, updated];
    }

    return updated;
  }
}

final demoStoreProvider = Provider<DemoStore>((ref) {
  return DemoStore();
});

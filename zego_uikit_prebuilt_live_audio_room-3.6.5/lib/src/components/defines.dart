// Flutter imports:
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

// Package imports:
import 'package:zego_uikit/zego_uikit.dart';

// size
Size get zegoLiveButtonSize => Size(72.zR, 72.zR);

Size get zegoLiveButtonIconSize => Size(40.zR, 40.zR);

SizedBox get zegoLiveButtonPadding =>
    SizedBox.fromSize(size: Size.fromRadius(8.zR));

/// @nodoc
enum ZegoLiveAudioRoomPopupItemValue {
  takeOnSeat,
  takeOffSeat,
  leaveSeat,
  muteSeat,
  inviteLink,
  assignCoHost,
  revokeCoHost,
  cancel,
}

class ZegoLiveAudioRoomPopupItem {
  final ZegoLiveAudioRoomPopupItemValue value;
  final String text;
  final dynamic data;

  const ZegoLiveAudioRoomPopupItem(this.value, this.text, {this.data});
}

/// @nodoc
class ZegoLiveAudioRoomImage {
  static Image asset(String name) {
    return Image.asset(name, package: 'zego_uikit_prebuilt_live_audio_room');
  }

  static AssetImage assetImage(String name) {
    return AssetImage(name, package: 'zego_uikit_prebuilt_live_audio_room');
  }

  static Padding svgAsset(String name) {
    return Padding(
      padding: const EdgeInsets.all(6.0),
      child: SvgPicture.asset(name,
          package: 'zego_uikit_prebuilt_live_audio_room'),
    );
  }
}

/// @nodoc
class ZegoLiveAudioRoomIconUrls {
  static const String im = 'assets/icons/toolbar_im.png';
  static const String back = 'assets/icons/back.png';
  static const String toolbarSoundEffect = 'assets/icons/toolbar_sound.png';
  static const String toolbarMicNormal = 'assets/icons/toolbar_mic_normal.png';
  static const String toolbarMicOff = 'assets/icons/toolbar_mic_off.png';
  static const String toolbarMember = 'assets/icons/toolbar_member.png';
  static const String toolbarMore = 'assets/icons/toolbar_more.png';
  static const String minimizing = 'assets/icons/minimizing.png';

  static const String memberMore = 'assets/icons/member_more.png';
  static const String toolbarAudienceConnect =
      'assets/icons/toolbar_audience_connect.png';
  static const String toolbarHostLockSeat =
      'assets/icons/toolbar_host_unlock_seat.png';
  static const String toolbarHostUnLockSeat =
      'assets/icons/toolbar_host_lock_seat.png';

  static const String topQuit = 'assets/icons/top_quit.png';

  static const String seatAdd = 'assets/icons/seat_add.png';
  static const String seatEmpty = 'assets/icons/seat_empty.png';
  static const String seatHost = 'assets/icons/seat_host.png';
  static const String seatCoHost = 'assets/icons/seat_cohost.png';
  static const String seatLock = 'assets/icons/seat_lock.png';
  static const String seatMicrophoneOff = 'assets/icons/seat_mic_off.png';
  static const String audioBackground = 'assets/icons/audio_background.png';

  static const String icAdd = 'assets/icons/ic_add.svg';
  static const String icComment = 'assets/icons/ic_comment.svg';
  static const String icLock = 'assets/icons/ic_lock.svg';
  static const String icLogout = 'assets/icons/ic_logout.svg';
  static const String icMicrophone = 'assets/icons/ic_microphone.svg';
  static const String icUnlock = 'assets/icons/ic_unlock.svg';
  static const String icUsers = 'assets/icons/ic_users.svg';
  static const String iconClose = 'assets/icons/icon_close.svg';
  static const String itemBg = 'assets/icons/item_bg.png';
  static const String icMicrophoneOff = 'assets/icons/ic_microphone_off.svg';
}

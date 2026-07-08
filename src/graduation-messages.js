export const GRADUATION_MESSAGES = [
  "Chúc mừng tốt nghiệp",
  "Bạn đã làm được rồi",
  "Tương lai thật sáng nhé",
  "Tự hào về bạn lắm",
  "Hành trình mới bắt đầu",
  "Rực rỡ nhé tân khoa",
  "Mọi nỗ lực đã nở hoa",
  "Bước tiếp thật tự tin",
  "Một cột mốc thật đẹp",
  "Chúc bạn bay thật xa",
  "Luôn tin vào chính mình",
  "Thành công đang chờ bạn",
];

export function randomMessage() {
  return GRADUATION_MESSAGES[
    Math.floor(Math.random() * GRADUATION_MESSAGES.length)
  ];
}

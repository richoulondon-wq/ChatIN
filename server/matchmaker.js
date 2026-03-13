// قائمة انتظار المستخدمين
let waitingUsers = []

// إضافة مستخدم إلى قائمة الانتظار
function addUser(socket) {
  if (!waitingUsers.includes(socket)) waitingUsers.push(socket)
}

// إزالة مستخدم من قائمة الانتظار
function removeUser(socket) {
  waitingUsers = waitingUsers.filter(u => u !== socket)
}

// العثور على شريك جاهز
function findPartner(socket) {
  // إذا القائمة فارغة، أضف المستخدم وانتظر شريك
  if (waitingUsers.length === 0) {
    addUser(socket)
    return null
  }

  // ابحث عن أول مستخدم متاح مختلف عن المستخدم الحالي
  const partner = waitingUsers.find(u => u !== socket)

  if (!partner) {
    addUser(socket)
    return null
  }

  // إزالة الشريك من قائمة الانتظار
  waitingUsers = waitingUsers.filter(u => u !== partner)

  // ربط الطرفين
  socket.partner = partner
  partner.partner = socket

  return partner
}

// الانتقال لشريك جديد
function nextPartner(socket) {
  // إبلاغ الشريك الحالي بالترك
  if (socket.partner) {
    socket.partner.partner = null
    socket.partner.emit("partner-left")
  }

  removeUser(socket)

  return findPartner(socket)
}

module.exports = { addUser, removeUser, findPartner, nextPartner }

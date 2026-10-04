# TUM.Artstudio

Website của TUM.Artstudio: tranh, workshop và lớp học vẽ tại Trích Sài, Tây Hồ, Hà Nội.

Xem trực tuyến: https://adrian9596.github.io/tum-artstudio/

## Cấu trúc

- `index.html`: trang chủ
- `tranh.html`, `workshop.html`, `khoa-hoc.html`, `doi-tac.html`, `ve-tum.html`, `lien-he.html`: các trang con
- `assets/css/style.css`: giao diện (màu, chữ, bố cục)
- `assets/js/main.js`: slideshow, xem ảnh lớn, menu trên điện thoại
- `assets/img/`: ảnh đã nén cho web (`*-t.jpg` là bản thu nhỏ)
- `assets/img/logo/`: logo vector (`tum-logo.svg` đầy đủ, `tum-monogram.svg` chỉ chữ TUM, `tum-favicon.svg` cho tab trình duyệt; màu #926C37) và các icon PNG

## Việc cần làm trước khi công bố chính thức

- Thay ảnh tạm ở trang Tranh bằng ảnh chụp từng bức tranh
- Kiểm tra link Facebook và TikTok (đánh dấu `TẠM` trong code)
- Duyệt các đoạn đánh dấu `NHÁP`, bổ sung phần `CẦN BỔ SUNG` của khoá Ký hoạ
- Xoá thẻ `<meta name="robots" content="noindex">` ở 7 trang để Google tìm thấy web

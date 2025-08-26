# Hướng dẫn Setup Git và GitHub cho RAN 40NQ Menu Order

## 📋 Tình trạng hiện tại

✅ **Đã hoàn thành:**
- Backup toàn bộ website thành file `ran-40nq-menu-backup.zip`
- Cấu hình 3 Telegram room IDs:
  - `TELEGRAM_AUTH_CHAT_ID`: -4936541799 (đăng nhập/đăng ký)
  - `TELEGRAM_ORDER_CHAT_ID`: -4882156924 (order món và bill thanh toán)
  - `TELEGRAM_VOUCHER_CHAT_ID`: -4871031372 (voucher và QR thanh toán)
- Cập nhật tất cả services sử dụng đúng room ID

⚠️ **Cần thực hiện:**
- Cài đặt Git
- Setup GitHub repository
- Push code lên GitHub
- Sync với Lovable

## 🛠️ Bước 1: Cài đặt Git

### Tải và cài đặt Git:
1. Truy cập: https://git-scm.com/download/windows
2. Tải Git for Windows
3. Chạy file installer và làm theo hướng dẫn
4. Khởi động lại PowerShell/Command Prompt

### Cấu hình Git:
```bash
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"
```

## 🐙 Bước 2: Setup GitHub Repository

### Tạo repository mới trên GitHub:
1. Đăng nhập GitHub: https://github.com
2. Click "New repository"
3. Đặt tên: `ran-40nq-menu-order`
4. Chọn "Private" nếu muốn repository riêng tư
5. Click "Create repository"

## 📤 Bước 3: Push code lên GitHub

Mở PowerShell trong thư mục project và chạy:

```bash
# Khởi tạo Git repository
git init

# Thêm tất cả files
git add .

# Commit đầu tiên
git commit -m "Initial commit: RAN 40NQ Menu Order with Telegram integration"

# Thêm remote repository (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/ran-40nq-menu-order.git

# Push lên GitHub
git push -u origin main
```

## 🔄 Bước 4: Sync với Lovable

### Kết nối GitHub với Lovable:
1. Đăng nhập Lovable: https://lovable.dev
2. Tạo project mới hoặc import từ GitHub
3. Chọn repository `ran-40nq-menu-order`
4. Lovable sẽ tự động sync code

### Cập nhật environment variables trong Lovable:
Đảm bảo các biến môi trường sau được cấu hình:
```
SUPABASE_URL=https://mrbupzghoxuzntenmazv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_AUTH_CHAT_ID=-4936541799
TELEGRAM_ORDER_CHAT_ID=-4882156924
TELEGRAM_VOUCHER_CHAT_ID=-4871031372
```

## 📁 Files đã được cập nhật

- `src/services/telegramService.ts` - Cấu hình 3 room IDs và functions
- `supabase/functions/telegram-order/index.ts` - Sử dụng ORDER_CHAT_ID
- `telegram-webhook-server.cjs` - Xử lý webhook callbacks

## ⚠️ Xử lý lỗi Supabase 403

**Vấn đề hiện tại:**
- Lỗi 403: "Your account does not have the necessary privileges to access this endpoint"
- Project ID đã được cập nhật từ `cypilqllrdjfhcdzqmdr` thành `mrbupzghoxuzntenmazv`

**Cách khắc phục:**

### 1. Đăng nhập Supabase CLI:
```bash
npx supabase login
```

### 2. Link project với database password:
```bash
npx supabase link --project-ref mrbupzghoxuzntenmazv
```
*Lưu ý: Cần database password từ Supabase Dashboard*

### 3. Lấy database password:
1. Truy cập: https://supabase.com/dashboard/project/mrbupzghoxuzntenmazv/settings/database
2. Reset password nếu cần
3. Copy password để sử dụng trong lệnh link

### 4. Deploy functions sau khi link thành công:
```bash
npx supabase functions deploy
```

## 📤 Deploy lên GitHub

### ✅ Đã cấu hình Git với tài khoản:
- **Username:** lyhoanghaiceobmcgroup
- **Email:** lyhoanghaiceo@gmail.com
- **Repository:** https://github.com/lyhoanghaiceobmcgroup/ran-40nq-menu-order.git

### Bước 1: Tạo GitHub Repository
1. Đăng nhập GitHub với tài khoản: **lyhoanghaiceobmcgroup**
2. Truy cập https://github.com/new
3. Đặt tên repository: `ran-40nq-menu-order`
4. Chọn **Public** (để dễ chia sẻ)
5. **KHÔNG** chọn "Initialize with README" (vì đã có code)
6. Click **Create repository**

### Bước 2: Push Code lên GitHub
```bash
# Code đã được chuẩn bị sẵn, chỉ cần push
git push -u origin main
```

**Lưu ý:** Nếu gặp lỗi authentication, có thể cần:
- Tạo Personal Access Token trên GitHub
- Hoặc sử dụng GitHub Desktop để đăng nhập

### Bước 3: Xác nhận Deploy thành công
- Kiểm tra code đã xuất hiện trên: https://github.com/lyhoanghaiceobmcgroup/ran-40nq-menu-order
- Copy URL repository để chia sẻ với team
- Setup GitHub Pages nếu muốn host static version

## 🚀 Tiếp theo

Sau khi hoàn thành các bước trên:
1. Test website trên Lovable
2. Deploy lên production
3. Kiểm tra tất cả Telegram integrations hoạt động đúng

## 🚀 Deploy lên Vercel

### Bước 1: Tạo tài khoản Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. Đăng ký/đăng nhập bằng GitHub account: `lyhoanghaiceobmcgroup`
3. Authorize Vercel truy cập GitHub repositories

### Bước 2: Import GitHub Repository
1. Click "New Project" trên Vercel dashboard
2. Import repository: `lyhoanghaiceobmcgroup/ran-40nq-menu-order`
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Bước 3: Cấu hình Environment Variables
Thêm các biến môi trường sau trong Vercel:
```
SUPABASE_URL=https://mrbupzghoxuzntenmazv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_AUTH_CHAT_ID=-4936541799
TELEGRAM_ORDER_CHAT_ID=-4882156924
TELEGRAM_VOUCHER_CHAT_ID=-4871031372
```

### Bước 4: Deploy
1. Click "Deploy" để bắt đầu deployment
2. Vercel sẽ tự động build và deploy project
3. Sau khi hoàn thành, bạn sẽ nhận được URL production

### Bước 5: Auto-deployment
- Vercel tự động deploy mỗi khi có commit mới push lên `main` branch
- Mỗi pull request sẽ tạo preview deployment
- Production deployment chỉ từ `main` branch

### Bước 6: Custom Domain (Tùy chọn)
1. Trong Vercel project settings
2. Vào tab "Domains"
3. Thêm custom domain của bạn
4. Cấu hình DNS records theo hướng dẫn

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra Git đã được cài đặt: `git --version`
2. Kiểm tra GitHub repository đã tạo thành công
3. Đảm bảo có quyền truy cập Supabase project
4. Verify Telegram bot tokens và chat IDs
5. Kiểm tra Vercel build logs nếu deployment thất bại

---

**Lưu ý:** File backup `ran-40nq-menu-backup.zip` chứa toàn bộ source code hiện tại để đảm bảo an toàn.
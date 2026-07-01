-- Drop static QR upload support — checkout now always uses dynamic VietQR
-- (bank_id + account_number + account_name + live amount + transfer content)
alter table bank_settings drop column if exists qr_image_url;

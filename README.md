# YARA Real Shop

## معماری
- Frontend: HTML/CSS/JavaScript
- Backend: Supabase
- Hosting: GitHub Pages یا هر هاست استاتیک HTTPS
- PWA: manifest + service worker
- Admin: /admin/

## راه‌اندازی
1. یک پروژه Supabase بسازید.
2. فایل `supabase/schema.sql` را در SQL Editor اجرا کنید.
3. در Project Settings > API مقدار Project URL و anon key را بردارید.
4. آن‌ها را داخل `config.js` قرار دهید.
5. فایل‌ها را روی GitHub Pages منتشر کنید.
6. در سایت یک حساب بسازید.
7. UUID کاربر را در Supabase > Authentication > Users ببینید.
8. در SQL Editor نقش آن کاربر را admin کنید:
   update public.profiles set role='admin' where id='UUID';
9. به `https://YOUR-SITE/admin/` بروید.

## پرداخت
ثبت سفارش در دیتابیس آماده است، اما درگاه پرداخت واقعی به کلید و API درگاه موردنظر شما نیاز دارد. بعد از مشخص شدن درگاه، endpoint امن پرداخت باید روی یک backend/serverless function اضافه شود؛ کلید خصوصی در frontend قرار داده نمی‌شود.

## PWA
پس از اینکه سایت با HTTPS در دسترس بود، URL را در PWABuilder وارد کنید. PWABuilder برای بسته‌بندی PWA در فروشگاه‌ها استفاده می‌شود.

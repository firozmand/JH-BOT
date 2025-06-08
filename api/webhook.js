// api/webhook.js

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // بارگذاری متغیرهای محیطی از فایل .env

// --- تنظیمات ---
// این مقادیر از .env (در توسعه لوکال) یا از Environment Variables در Vercel خوانده می‌شوند.
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_BASE_URL = process.env.WEBHOOK_URL; // URL اصلی پروژه Vercel شما
const BOT_USERNAME = process.env.BOT_USERNAME; // یوزرنیم بات شما (بدون @)
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME; // یوزرنیم کانال شما (بدون @)

// اعتبارسنجی اولیه برای متغیرهای محیطی حیاتی
if (!TOKEN || !WEBHOOK_BASE_URL || !BOT_USERNAME || !CHANNEL_USERNAME) {
    console.error('❌ یک یا چند متغیر محیطی حیاتی پیدا نشدند!');
    console.error('لطفاً مطمئن شوید TELEGRAM_BOT_TOKEN, WEBHOOK_URL, BOT_USERNAME, و CHANNEL_USERNAME تنظیم شده‌اند.');
    // در محیط Vercel، اگر اینها نباشند، معمولاً یک خطای تنظیمات است.
}

// یک نمونه جدید از بات تلگرام ایجاد کنید.
// نکته مهم: برای Serverless Functions در Vercel، از polling: true استفاده نکنید.
// بات به‌روزرسانی‌ها را از طریق وب‌هوک دریافت خواهد کرد.
const bot = new TelegramBot(TOKEN);

// --- داده‌های بازی (حقیقت و جرأت) ---
const truths = [
    'آخرین دروغی که گفتی چی بوده؟',
    'تا حالا کسی رو دوست داشتی که نباید؟',
    'بزرگترین ترست چیه؟',
    'تا حالا به کسی که تو این جمع هست علاقه داشتی؟',
    'اولین بوسه‌ات چه‌جوری بود؟',
    'تا حالا عاشق کسی شدی که بهت توجه نکرده باشه؟',
    'تا حالا به بهترین دوستت اعتراف عشق کردی؟',
    'تا حالا به خاطر کسی که عاشقش بودی یه رابطه رو تموم کردی؟',
    'تا حالا به کسی که دوستش داشتی حسودی کردی؟ چرا؟',
    'شرم‌آورترین اتفاقی که تو یه رابطه برات افتاده چی بوده؟',
    'تا حالا به کسی که می‌دونی علاقه‌ای بهت نداره، ابراز علاقه کردی؟',
    'کثیف‌ترین دروغی که به کسی گفتی چی بوده؟',
    'تا حالا کسی رو بوسیدی که بعدش پشیمون شده باشی؟',
    'خجالت‌آورترین چیزی که والدینت ازت دیدن چی بوده؟',
    'تا حالا از روی حسادت به کسی تهمت زدی؟',
    'تا حالا شده توی یه مهمونی یا جمع «چشم‌چرونی» کنی؟',
    'تا حالا شده تو رابطه‌ای باشی که فقط به خاطر مسائل خاص ادامه دادی؟',
    'ناجورترین چیزی که تا حالا تو ذهنت داشتی ولی نگفتی چی بوده؟',
    'تا حالا شده تو یه قرار، بخوای خیلی زودتر از اونجا بزنی بیرون ولی نتونی؟',
    'اگه فردا صبح بیدار بشی ببینی جنسیتت عوض شده اولین کاری که می‌کنی چیه؟',
    'توی این اتاق از کی بیشتر خوشت میاد؟',
    'توی این اتاق از کی بیشتر بدت میاد؟',
    'اگر قرار باشه فردا دنیا به پایان برسه الان چیکار می‌کنی؟',
    'اگه دوست صمیمیت از پسری که دوسش داری خوشش بیاد چیکار می‌کنی؟',
    'تو جذابتری یا بهترین دوستت؟',
    'اگه مجبور باشی همه رو ببخشی غیر از یک نفر، اون یک نفر که نمی‌بخشی کیه؟',
    'هیجان‌انگیزترین خلافی که کردی چی بود؟',
    'چه رویای خاصی در سر داری؟',
    'تا حالا راز دوستات رو به کسی گفتی؟',
    'تو زندگیت به کی بیشتر از همه حسادت کردی؟',
    'معیارت برای پارتنر رویاهات چیه؟',
    'هیجان‌انگیزترین اتفاق زندگیت چی بود؟',
    'کراشت کیه؟',
    'پنج تا از جذاب‌ترین دخترهایی که می‌شناسی رو نام ببر',
    'اگه فقط یک چیز رو می‌تونستی بدون محدودیت مالی بخری، اون چی بود؟',
    'اگه بهت بگن مجبوری همه رو ببخشی غیر از یک نفر، اون یک نفر که نمی‌بخشی کیه؟',
    'به پارتنرت بگو که بهترین ویژگی‌اش که تو رو جذب کرده چیه',
    'تا حالا مواد مخدر مصرف کردی؟',
    'دوست داری چی در مخاطب خاصت تغییر کنه؟',
    'دوست داری چندتا بچه داشته باشی؟',
    'مهم‌ترین ناامنی که تو رابطه حس می‌کنی چیه؟',
    'برای اینکه جذاب به نظر برسی چیکار می‌کنی؟',
    'جذاب‌ترین ویژگی مردها/زن‌ها چیه؟',
    'اگه می‌شد پسر/دختر (جنس مخالف) بشی با کی می‌رفتی تو رابطه؟',
    'جذاب‌ترین جنس مخالفی که می‌شناسی کیه؟',
    'آخرین بار که گریه کردی کی بود؟ به خاطر چی؟',
    'تا حالا در نگاه اول عاشق شدی؟',
    'به جذابیت و زیبایی خودت از 10 چه نمره‌ای می‌دی؟',
    'دوست داری چطوری بمیری؟'
];

const dares = [
    'شرم‌آورترین عکس را در گالری خود به ما نشان دهید.',
    'بزرگترین آروغی را که می‌توانید بیرون بگذارید.',
    'یک موز را به اغواکننده‌ترین شکلی که می‌توانید بخورید.',
    'یک ماساژ پنج دقیقه‌ای پا به من بدهید.',
    'بذار 5 دقیقه هرکاری می‌خوام با گوشیت انجام بدم.',
    '15 بار دور خود بچرخید و سپس سعی کنید لب‌های مرا ببوسید.',
    'کثیف‌ترین رازت را در گوش من بگو.',
    'یک تکه فلفل بزرگ بخور.',
    'یک قاشق کره بخور.',
    'یک قطعه یخ در شلوار خود قرار بده و صبر کن تا آب شود.',
    'اجازه بده شرکت‌کننده‌ها تو را آرایش کنند (مخصوص پسرها).',
    'آرایشت را پاک کن (مخصوص دخترها).',
    'لباس دخترونه بپوش و عکس بگیر.',
    'لباس پسرونه بپوش و عکس بگیر.',
    'دست خود را تا آرنج داخل سطل زباله فرو ببر.',
    'نام خود را با زبان روی زمین بنویس.',
    'لپ شرکت‌کننده سمت راست خود را ببوس.',
    'جوراب بغل‌دستی خود را تا پایان بازی مانند دستکش استفاده کن.',
    'به بالای پشت بام برو و فریاد بزن من بچه سر راهی هستم.',
    'کاغذ شکلات را تنها با استفاده از دهان خود باز کن.',
    'با دست‌های خود از یک طرف اتاق به طرف دیگر برو، بهتر است یکی از شرکت‌کنندگان پاها را بالا نگه دارد.',
    'یک عدد پیاز خام بخور و گریه نکن.',
    'عکس کارت ملی جدیدت را در پروفایل خود قرار بده.',
    'چهار تکه از لباس‌هایت را با شرکت‌کننده سمت راستت عوض کن.',
    'تلفن همراه خود را به یکی از شرکت‌کنندگان بده تا یک پیام برای هر کسی که در لیست تماس‌ها است ارسال کند.',
    'دندان‌های شرکت‌کننده روبرویت را مسواک بزن.',
    'اولین کلمه‌ای که به ذهنت می‌رسد را فریاد بزن.',
    'یک عدد لیمو ترش بخور و واکنش نشان نده.',
    'با صدای بلند یک شعر کودکانه بخوان.',
    'برای 2 دقیقه به زبان حیوانات صحبت کن.',
    'با چشم‌های بسته یک نقاشی بکش و نشان بده.',
    'با دهان خود یک آهنگ بنواز.',
    'برای 1 دقیقه روی یک پا بایست.',
    'یک داستان خنده‌دار بساز و تعریف کن.',
    'با استفاده از وسایل موجود یک کلاه بساز و بر سر بگذار.',
    'یک جوک تعریف کن که همه بخندند.',
    'با صدای یک شخصیت کارتونی صحبت کن.',
    'برای 30 ثانیه حرکات ورزشی انجام بده.',
    'یک حرکت رقص خنده‌دار انجام بده.',
    'با چشمان بسته یک شیء را لمس کن و حدس بزن چیست.',
    'با استفاده از اشیاء اطراف یک ساز بساز و بنواز.',
    'یک جمله عاشقانه به زبان دیگری بگو.',
    'با صدای بلند بخند بدون دلیل.',
    'یک حرکت جالب با انگشتان دستت انجام بده.',
    'برای 1 دقیقه بدون پلک زدن به یک نقطه خیره شو.',
    'با یک صدای عجیب صحبت کن.',
    'یک داستان ترسناک کوتاه تعریف کن.',
    'با استفاده از اشیاء اطراف یک مجسمه بساز.',
    'برای 30 ثانیه بدون حرکت بایست.',
    'با صدای بلند نام خود را بگو و بپر.'
];

// --- مدیریت وضعیت بازی ---
// هشدار: در Serverless Functions Vercel، متغیرهای سراسری مانند 'activeGames'
// تضمین نمی‌شوند که بین فراخوانی‌ها حفظ شوند. برای مدیریت وضعیت پایدار در محیط تولید،
// باید از یک پایگاه داده پایدار (مانند Redis, MongoDB, PostgreSQL) استفاده کنید.
const activeGames = {}; // { chatId: { player1: id, player2: id, turn: 1|2, mode: 'truth'|'dare'|'random', messageId: null } }

// تابع کمکی برای بررسی عضویت در کانال
const checkMembership = async (userId) => {
    if (!CHANNEL_USERNAME) {
        console.warn('CHANNEL_USERNAME تنظیم نشده است. بررسی عضویت نادیده گرفته می‌شود.');
        return true; // اگر کانال تنظیم نشده باشد، فرض می‌کنیم کاربر عضو است (برای توسعه)
    }
    try {
        const chatMember = await bot.getChatMember(`@${CHANNEL_USERNAME}`, userId);
        const status = chatMember.status;
        return ['member', 'administrator', 'creator'].includes(status);
    } catch (e) {
        console.error(`خطا در بررسی عضویت کاربر ${userId} در کانال @${CHANNEL_USERNAME}:`, e.message);
        // این خطا اغلب به این معنی است که ربات ادمین کانال نیست، یا یوزرنیم کانال اشتباه است.
        return false;
    }
};

// تابع کمکی برای کیبورد منوی اصلی
function mainMenu() {
    return {
        reply_markup: {
            keyboard: [['🎯 جرأت', '🧐 حقیقت'], ['/2player'], ['🏠 بازگشت به خانه']],
            resize_keyboard: true // کیبورد را کوچکتر می‌کند
        }
    };
}

// تابع کمکی برای کیبورد اینلاین داخل بازی
function turnMessage(turn) {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🎲 سوال بعدی', callback_data: 'next_question' },
                    { text: '🔁 عوض کردن حالت', callback_data: 'switch_mode' }
                ],
                [{ text: '✅ جواب دادم', callback_data: 'answered' }],
                [{ text: '⛔ توقف بازی', callback_data: 'stop_game' }]
            ]
        }
    };
}

// --- شنونده‌های رویداد بات تلگرام ---
// این توابع یک بار هنگام بارگذاری اسکریپت تعریف می‌شوند.
// bot.processUpdate(update) باعث فعال شدن این شنونده‌ها بر اساس به‌روزرسانی ورودی می‌شود.

// دستور /start با پارامتر (مثلاً /start join_12345) را هندل می‌کند
bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const commandParam = match[1]; // مثلاً 'join_12345'

    const isMember = await checkMembership(userId);
    if (!isMember) {
        await bot.sendMessage(chatId, `برای استفاده از ربات، ابتدا عضو کانال @${CHANNEL_USERNAME} شو:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📢 ورود به کانال', url: `https://t.me/${CHANNEL_USERNAME}` }],
                    [{ text: 'عضو شدم ✅', callback_data: 'check_membership' }]
                ]
            }
        });
        return;
    }

    if (commandParam && commandParam.startsWith('join_')) {
        const inviterId = parseInt(commandParam.split('_')[1], 10);

        // جلوگیری از دعوت خود شخص به بازی
        if (inviterId === userId) {
            await bot.sendMessage(chatId, 'نمی‌تونی خودت رو به بازی دعوت کنی! یک دوست رو دعوت کن.');
            return;
        }

        const game = activeGames[inviterId];
        if (!game || game.player2) { // بازی پیدا نشد یا قبلاً بازیکن دوم دارد
            await bot.sendMessage(chatId, '❌ لینک بازی منقضی شده یا بازی قبلاً شروع شده است.');
            return;
        }

        // بررسی اینکه کاربر فعلی از قبل در یک بازی فعال دیگر نباشد
        if (Object.values(activeGames).some(g => g.player1 === userId || g.player2 === userId)) {
            await bot.sendMessage(chatId, 'شما از قبل در یک بازی هستید! لطفاً ابتدا بازی فعلی را متوقف کنید.');
            return;
        }

        game.player2 = userId; // ID بازیکن دوم را به عنوان کاربر فعلی تنظیم کنید
        game.turn = 1; // نوبت بازیکن اول را شروع کنید
        // وضعیت بازی را برای هر دو بازیکن در activeGames ذخیره کنید تا هر دو بتوانند آن را پیدا کنند
        activeGames[game.player1] = game;
        activeGames[game.player2] = game;

        await bot.sendMessage(game.player1, '✅ بازیکن دوم پیوست! بازی شروع شد.');
        await bot.sendMessage(game.player2, '🎉 وارد بازی شدی! صبر کن تا نوبتت برسه.');

        // ارسال اولین سوال به بازیکن اول
        const list = Math.random() > 0.5 ? truths : dares;
        const question = list[Math.floor(Math.random() * list.length)];
        const sentMsg = await bot.sendMessage(game.player1, `🎮 نوبت شماست!\n❓ سوال:\n${question}`, turnMessage(game.turn));
        game.messageId = sentMsg.message_id; // ذخیره ID پیام برای ویرایش‌های بعدی
    } else {
        // اگر فقط /start بدون پارامتر بود
        await bot.sendMessage(chatId, 'سلام! یکی از گزینه‌ها رو انتخاب کن:', mainMenu());
    }
});

// دستور /start بدون پارامتر را هندل می‌کند
bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const isMember = await checkMembership(userId);
    if (!isMember) {
        await bot.sendMessage(chatId, `برای استفاده از ربات، ابتدا عضو کانال @${CHANNEL_USERNAME} شو:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📢 ورود به کانال', url: `https://t.me/${CHANNEL_USERNAME}` }],
                    [{ text: 'عضو شدم ✅', callback_data: 'check_membership' }]
                ]
            }
        });
        return;
    }
    await bot.sendMessage(chatId, 'سلام! یکی از گزینه‌ها رو انتخاب کن:', mainMenu());
});

// سایر پیام‌های متنی (دکمه‌های حقیقت، جرأت، /2player، بازگشت به خانه) را هندل می‌کند
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    // دستورات /start قبلاً توسط onText(/start...) هندل شده‌اند، اینجا نادیده گرفته می‌شوند
    if (text && text.startsWith('/start')) return;
    if (msg.from.is_bot) return; // پیام‌های خود بات یا بات‌های دیگر را نادیده بگیرید

    const isMember = await checkMembership(userId);
    if (!isMember) {
        // این بررسی قبلاً توسط /start انجام شده، اما برای سایر پیام‌ها هم مفید است
        await bot.sendMessage(chatId, `برای استفاده از ربات، ابتدا عضو کانال @${CHANNEL_USERNAME} شو:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📢 ورود به کانال', url: `https://t.me/${CHANNEL_USERNAME}` }],
                    [{ text: 'عضو شدم ✅', callback_data: 'check_membership' }]
                ]
            }
        });
        return;
    }

    // حالت تک نفره (دکمه‌های حقیقت/جرأت)
    if (text === '🧐 حقیقت') {
        const item = truths[Math.floor(Math.random() * truths.length)];
        await bot.sendMessage(chatId, `🧐 حقیقت:\n${item}`, mainMenu());
        return;
    } else if (text === '🎯 جرأت') {
        const item = dares[Math.floor(Math.random() * dares.length)];
        await bot.sendMessage(chatId, `🎯 جرأت:\n${item}`, mainMenu());
        return;
    }

    // تنظیم حالت بازی دو نفره
    if (text === '/2player') {
        // بررسی کنید که کاربر از قبل در یک بازی فعال نباشد
        if (activeGames[userId] || Object.values(activeGames).some(g => g.player2 === userId && g.player1 !== userId)) {
            await bot.sendMessage(chatId, 'شما از قبل در یک بازی هستید! لطفاً ابتدا بازی فعلی را متوقف کنید.', mainMenu());
            return;
        }
        activeGames[chatId] = { player1: chatId, player2: null, turn: 1, mode: 'random', messageId: null };
        await bot.sendMessage(chatId, '🎯 دوستتو به بازی دعوت کن:', {
            reply_markup: {
                inline_keyboard: [[{ text: '👥 دعوت به بازی', url: `https://t.me/${BOT_USERNAME}?start=join_${chatId}` }]]
            }
        });
        return;
    }

    // دکمه "بازگشت به خانه" برای همه کاربران در هر حالتی
    if (text === '🏠 بازگشت به خانه') {
        const game = activeGames[userId] || Object.values(activeGames).find(g => g.player2 === userId);
        if (game) {
            // حذف وضعیت بازی برای هر دو بازیکن
            delete activeGames[game.player1];
            if (game.player2) delete activeGames[game.player2];
            // اطلاع به هر دو بازیکن اگر بازی دو نفره بود
            await bot.sendMessage(game.player1, '❌ بازی متوقف شد.', mainMenu());
            if (game.player2 && game.player2 !== game.player1) {
                await bot.sendMessage(game.player2, '❌ بازی متوقف شد.', mainMenu());
            }
        }
        await bot.sendMessage(chatId, '🏠 برگشتی به منوی اصلی.', mainMenu());
        return;
    }

    // اگر پیام، یک دستور یا دکمه هندل شده نبود و بخشی از یک بازی فعال ۲ نفره بود
    const game = activeGames[userId]; // بررسی کنید که این کاربر بازیکن اول یا دوم در یک بازی است
    if (game) {
        const isTurn = (game.turn === 1 && userId === game.player1) ||
            (game.turn === 2 && userId === game.player2);

        if (isTurn) {
            const targetChatId = (game.player1 === userId) ? game.player2 : game.player1;
            if (targetChatId) {
                try {
                    await bot.forwardMessage(targetChatId, chatId, msg.message_id);
                    // اختیاری: تایید ارسال پیام
                    // await bot.sendMessage(chatId, 'پیام شما ارسال شد.');
                } catch (e) {
                    console.error('خطا در فوروارد پیام:', e.message);
                    await bot.sendMessage(chatId, 'خطایی در ارسال پیام به بازیکن دیگر رخ داد.');
                }
            }
        } else {
            await bot.sendMessage(chatId, 'الان نوبت شما نیست! ⏳', { reply_to_message_id: msg.message_id });
        }
        return;
    }

    // بازگشت به حالت پیش‌فرض برای پیام‌های نامفهوم
    await bot.sendMessage(chatId, 'متوجه نشدم! لطفا از گزینه‌ها یا دستورات موجود استفاده کنید.', mainMenu());
});

// کلیک‌های دکمه‌های اینلاین کیبورد را هندل می‌کند
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id; // کاربری که روی دکمه کلیک کرد
    const data = query.data; // رشته callback_data

    // بررسی عضویت در کانال را ابتدا هندل کنید
    if (data === 'check_membership') {
        const isMember = await checkMembership(userId);
        if (isMember) {
            await bot.answerCallbackQuery(query.id, { text: '✅ شما عضو کانال هستید!' });
            await bot.sendMessage(chatId, 'عضویت شما تایید شد! حالا می‌تونید از بات استفاده کنید.', mainMenu());
        } else {
            await bot.answerCallbackQuery(query.id, { text: 'هنوز عضو کانال نیستید یا عضویت شما تایید نشده است. لطفا دوباره امتحان کنید.' });
        }
        return;
    }

    // پیدا کردن بازی فعالی که این کاربر در آن حضور دارد
    const game = activeGames[userId] || Object.values(activeGames).find(g => g.player2 === userId);

    if (!game || (game.player1 !== userId && game.player2 !== userId)) {
        // اگر بازی‌ای برای این کاربر پیدا نشد، یا دکمه از یک بازی قدیمی/نامربوط است
        await bot.answerCallbackQuery(query.id, { text: 'بازی‌ای پیدا نشد یا این دکمه مربوط به بازی شما نیست.' });
        return;
    }

    // بررسی اینکه آیا نوبت بازیکن فعلی است (فقط برای اقدامات مربوط به بازی، نه 'stop_game')
    const isTurn = (game.turn === 1 && userId === game.player1) ||
        (game.turn === 2 && userId === game.player2);

    if (!isTurn && data !== 'stop_game') { // 'stop_game' را هر کسی در بازی می‌تواند کلیک کند
        await bot.answerCallbackQuery(query.id, { text: 'الان نوبت شما نیست! ⏳' });
        return;
    }

    switch (data) {
        case 'next_question':
            const listForNextQ = game.mode === 'truth' ? truths : game.mode === 'dare' ? dares : (Math.random() > 0.5 ? truths : dares);
            const q = listForNextQ[Math.floor(Math.random() * listForNextQ.length)];

            try {
                await bot.editMessageText(`❓ سوال:\n${q}`, {
                    chat_id: chatId, // پیام را در چت فعلی ویرایش کنید
                    message_id: query.message.message_id,
                    reply_markup: turnMessage(game.turn).reply_markup
                });
            } catch (error) {
                console.error("خطا در ویرایش پیام برای سوال بعدی:", error.message);
                // اگر پیام برای ویرایش خیلی قدیمی بود، یک پیام جدید بفرستید
                await bot.sendMessage(chatId, `❓ سوال:\n${q}`, turnMessage(game.turn));
            }
            await bot.answerCallbackQuery(query.id);
            break;

        case 'switch_mode':
            game.mode = game.mode === 'truth' ? 'dare' : 'truth';
            await bot.answerCallbackQuery(query.id, { text: `تغییر حالت به ${game.mode === 'truth' ? '🧐 حقیقت' : '🎯 جرأت'}` });
            break;

        case 'answered':
            // تغییر نوبت
            game.turn = game.turn === 1 ? 2 : 1;
            const nextPlayerChatId = game.turn === 1 ? game.player1 : game.player2;

            // تولید سوال/جرأت بعدی
            const qListForNextTurn = game.mode === 'truth' ? truths : game.mode === 'dare' ? dares : (Math.random() > 0.5 ? truths : dares);
            const q2 = qListForNextTurn[Math.floor(Math.random() * qListForNextTurn.length)];

            // ارسال سوال جدید به بازیکن بعدی
            const sentMsgForNextTurn = await bot.sendMessage(nextPlayerChatId, `🎮 نوبت شماست!\n❓ سوال:\n${q2}`, turnMessage(game.turn));
            game.messageId = sentMsgForNextTurn.message_id; // ID پیام را برای سوال جدید به‌روزرسانی کنید

            // ویرایش پیام بازیکن فعلی برای تایید پاسخ و نمایش گزینه‌های حداقل
            try {
                await bot.editMessageText(`✅ سوال جواب داده شد! نوبت نفر بعدی است.`, {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    reply_markup: { inline_keyboard: [[{ text: '⛔ توقف بازی', callback_data: 'stop_game' }]] }
                });
            } catch (error) {
                console.error("خطا در ویرایش پیام برای 'جواب داده شد':", error.message);
            }

            await bot.answerCallbackQuery(query.id, { text: 'نوبت تغییر کرد ✅' });
            break;

        case 'stop_game':
            const player1ChatId = game.player1;
            const player2ChatId = game.player2;

            // حذف وضعیت بازی برای هر دو بازیکن از activeGames
            delete activeGames[player1ChatId];
            if (player2ChatId && player2ChatId !== player1ChatId) {
                delete activeGames[player2ChatId];
            }

            // اطلاع به هر دو بازیکن که بازی متوقف شد
            await bot.sendMessage(player1ChatId, '❌ بازی متوقف شد.', mainMenu());
            if (player2ChatId && player2ChatId !== player1ChatId) {
                await bot.sendMessage(player2ChatId, '❌ بازی متوقف شد.', mainMenu());
            }

            // حذف کیبورد اینلاین از پیامی که دکمه کلیک شد
            try {
                await bot.editMessageReplyMarkup(
                    { inline_keyboard: [[{ text: 'بازی متوقف شد.', callback_data: 'stopped' }]] }, // یک دکمه دامی یا فقط خالی
                    { chat_id: chatId, message_id: query.message.message_id }
                );
            } catch (error) {
                console.warn("نمی‌توان کیبورد پیام را بعد از توقف بازی ویرایش کرد:", error.message);
            }

            await bot.answerCallbackQuery(query.id, { text: 'بازی متوقف شد.' });
            break;
    }
});

// --- هندلر اصلی وب‌هوک (برای Vercel صادر شده است) ---
module.exports = async (req, res) => {
    // اطمینان حاصل کنید که درخواست از تلگرام از نوع POST است
    if (req.method !== 'POST') {
        return res.status(200).send('این وب‌هوک فقط درخواست‌های POST را می‌پذیرد.');
    }

    // تلگرام به‌روزرسانی‌ها را به عنوان JSON در بدنه درخواست ارسال می‌کند
    const update = req.body;

    // مهم: به‌روزرسانی را با نمونه بات پردازش کنید.
    // این کار شنونده‌های مناسب ('onText', 'on("message")', یا 'on("callback_query")') را فعال می‌کند.
    bot.processUpdate(update);

    // بلافاصله یک پاسخ 200 OK ارسال کنید.
    // این به تلگرام می‌گوید که به‌روزرسانی با موفقیت دریافت شده و نیازی به ارسال مجدد آن نیست.
    // هر عملیات طولانی‌مدت باید به صورت ناهمزمان پس از این پاسخ انجام شود.
    res.status(200).send('OK');
};
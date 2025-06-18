const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACebd319be5d5949ec2917336d078a2fa5';
const authToken = process.env.TWILIO_AUTH_TOKEN || '0c7e95c0f195bbe42fddb49e16bf0643';
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+19793987866';

// Store user sessions
const userSessions = {};

// Home route
app.get('/', (req, res) => {
    res.send('🎓 HadiChat WhatsApp Bot 🤖 Bot is running! 📱 WhatsApp: +19793987866 🚀 Ready for English tutoring conversations');
});

// Detect language
function detectLanguage(message) {
    const turkishWords = ['merhaba', 'selam', 'nasıl', 'nedir', 'evet', 'hayır', 'teşekkür', 'lütfen', 'ders', 'kurs', 'öğrenmek', 'ingilizce'];
    const messageWords = message.toLowerCase().split(' ');
    const turkishCount = messageWords.filter(word => turkishWords.includes(word)).length;
    return turkishCount > 0 ? 'turkish' : 'english';
}

// Generate response
function generateResponse(message, userPhone) {
    const language = detectLanguage(message);
    const session = userSessions[userPhone] || { step: 'start', language: language };
    userSessions[userPhone] = session;

    const msg = message.toLowerCase();

    // Turkish responses
    if (language === 'turkish' || msg.includes('merhaba') || msg.includes('selam')) {
        if (msg.includes('merhaba') || msg.includes('selam') || session.step === 'start') {
            session.step = 'main_menu';
            return `🎓 *HadiChat'e Hoş Geldiniz!*

Merhaba! Ben HadiChat, İngilizce öğrenme yolculuğunuzda size yardımcı olacak AI asistanınızım.

*Nasıl yardımcı olabilirim?*

1️⃣ 📚 Kurs Bilgileri
2️⃣ 💰 Fiyatlar  
3️⃣ 📅 Ders Programı
4️⃣ 📊 Seviye Testi
5️⃣ 👨‍🏫 Öğretmen İletişim
6️⃣ 🇬🇧 Switch to English

Lütfen bir numara seçin veya yazmak istediğinizi belirtin.`;
        }

        if (msg.includes('1') || msg.includes('kurs') || msg.includes('bilgi')) {
            return `📚 *Kurs Bilgilerimiz*

*🟢 Başlangıç Seviyesi (Beginner)*
• Temel kelime hazinesi
• Basit günlük konuşmalar
• Alfabe ve telaffuz

*🟡 Orta Seviye (Intermediate)*  
• Günlük konuşma becerisi
• Gramer kuralları
• İş İngilizcesi temelleri

*🔴 İleri Seviye (Advanced)*
• Akıcı konuşma
• Akademik İngilizce
• İş görüşmeleri hazırlığı

*📖 Ders Formatı:*
• 1-1 özel dersler
• Online video görüşme
• Kişiselleştirilmiş müfredat
• Esnek ders saatleri

Hangi seviye hakkında daha fazla bilgi almak istersiniz?`;
        }

        if (msg.includes('2') || msg.includes('fiyat') || msg.includes('ücret')) {
            return `💰 *Fiyat Bilgileri*

*💎 Özel Ders Ücretleri:*
• Saatlik: ₺200
• 4 Ders Paketi: ₺720 (₺180/ders)
• 8 Ders Paketi: ₺1.360 (₺170/ders)
• 12 Ders Paketi: ₺1.920 (₺160/ders)

*🎁 Özel Avantajlar:*
• İlk ders ücretsiz deneme
• Esnek ödeme seçenekleri
• İptal durumunda iade garantisi
• 7/24 WhatsApp desteği

Hangi paket sizin için uygun?`;
        }

        if (msg.includes('5') || msg.includes('öğretmen') || msg.includes('iletişim')) {
            return `👨‍🏫 *Öğretmen İletişim*

*Shammas BK - İngilizce Öğretmeni*

Bu WhatsApp numarasından direkt benimle konuşabilirsiniz!

🎓 *Deneyim:*
• 5+ yıl online İngilizce öğretmenliği
• Türk öğrencilere özel metodoloji
• AI destekli öğretim teknikleri

Hemen başlayalım! 😊`;
        }
    }

    // English responses
    if (language === 'english' || msg.includes('hello') || msg.includes('hi') || msg.includes('english')) {
        return `🎓 *Welcome to HadiChat!*

Hello! I'm HadiChat, your AI assistant for learning English.

*How can I help you?*

1️⃣ 📚 Course Information
2️⃣ 💰 Pricing
3️⃣ 📅 Schedule
4️⃣ 📊 Level Test
5️⃣ 👨‍🏫 Contact Teacher
6️⃣ 🇹🇷 Türkçe'ye geç

Please select a number or tell me what you'd like to know!`;
    }

    // Default response
    return `Merhaba! HadiChat'e hoş geldiniz. "Merhaba" yazarak başlayabilirsiniz.

Hello! Welcome to HadiChat. Type "Hello" to start in English.`;
}

// WhatsApp webhook
app.post('/webhook', (req, res) => {
    const incomingMessage = req.body.Body;
    const fromNumber = req.body.From;
    
    console.log(`Message from ${fromNumber}: ${incomingMessage}`);
    
    if (!incomingMessage || !fromNumber) {
        return res.status(400).send('Bad Request');
    }

    try {
        const responseText = generateResponse(incomingMessage, fromNumber);
        
        // Send response back via Twilio
        client.messages.create({
            from: twilioPhoneNumber,
            to: fromNumber,
            body: responseText
        })
        .then(message => {
            console.log(`Response sent: ${message.sid}`);
            res.status(200).send('OK');
        })
        .catch(error => {
            console.error('Error sending message:', error);
            res.status(500).send('Error sending message');
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).send('Error processing message');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`HadiChat WhatsApp Bot running on port ${PORT}`);
    console.log(`Webhook URL: https://hadichat-whatsapp-bot-production.up.railway.app/webhook`);
});

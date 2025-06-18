const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Your Twilio Configuration
const accountSid = 'ACebd319be5d5949ec2917336d078a2fa5';
const authToken = '0c7e95c0f195bbe42fddb49e16bf0643';
const client = twilio(accountSid, authToken);

// HadiChat Conversation Logic
class HadiChatBot {
    constructor() {
        this.userStates = new Map();
        this.courses = {
            beginner: { name: 'Başlangıç', price: '₺200/saat', description: 'Temel İngilizce, günlük konuşma' },
            intermediate: { name: 'Orta Seviye', price: '₺200/saat', description: 'İş İngilizcesi, akademik konuşma' },
            advanced: { name: 'İleri Seviye', price: '₺200/saat', description: 'Akıcı konuşma, IELTS/TOEFL hazırlık' }
        };
    }

    detectLanguage(message) {
        const turkishWords = ['merhaba', 'nasıl', 'nedir', 'hakkında', 'bilgi', 'kurs', 'ders', 'öğretmen', 'zaman', 'saat', 'fiyat', 'teşekkür'];
        const lowerMessage = message.toLowerCase();
        return turkishWords.some(word => lowerMessage.includes(word)) ? 'tr' : 'en';
    }

    generateResponse(message, from) {
        const userState = this.userStates.get(from) || { step: 'welcome', language: 'tr' };
        const language = this.detectLanguage(message);
        const msg = message.toLowerCase();

        // Welcome Flow
        if (userState.step === 'welcome' || msg.includes('start') || msg.includes('merhaba') || msg.includes('hello')) {
            this.userStates.set(from, { ...userState, step: 'main_menu', language });
            
            if (language === 'tr') {
                return `🎓 *HadiChat'e Hoş Geldiniz!*

Merhaba! Ben HadiChat, İngilizce öğrenim yardımcınızım. Size nasıl yardımcı olabilirim?

📚 *Seçenekler:*
1️⃣ Kurs bilgileri
2️⃣ Fiyatlar ve paketler
3️⃣ Seviye testi
4️⃣ Ders programı
5️⃣ Öğretmen ile görüşme

Lütfen bir numara seçin veya sorunuzu yazın! 😊`;
            } else {
                return `🎓 *Welcome to HadiChat!*

Hello! I'm HadiChat, your English learning assistant. How can I help you today?

📚 *Options:*
1️⃣ Course information
2️⃣ Pricing and packages
3️⃣ Level assessment
4️⃣ Schedule
5️⃣ Talk to teacher

Please select a number or type your question! 😊`;
            }
        }

        // Course Information
        if (msg.includes('1') || msg.includes('kurs') || msg.includes('course') || msg.includes('bilgi')) {
            this.userStates.set(from, { ...userState, step: 'courses' });
            
            if (language === 'tr') {
                return `📚 *İngilizce Kurslarımız*

🌟 *Başlangıç Seviyesi*
• Temel gramer ve kelime bilgisi
• Günlük konuşma becerileri
• ₺200/saat

⭐ *Orta Seviye*
• İş İngilizcesi
• Akademik yazım
• ₺200/saat

🏆 *İleri Seviye*
• Akıcı konuşma
• IELTS/TOEFL hazırlık
• ₺200/saat

*Paket Fiyatları:*
• 4 ders: ₺750 (₺50 indirim)
• 8 ders: ₺1400 (₺200 indirim)

Hangi seviye ilginizi çekiyor? 🤔`;
            } else {
                return `📚 *Our English Courses*

🌟 *Beginner Level*
• Basic grammar and vocabulary
• Daily conversation skills
• ₺200/hour

⭐ *Intermediate Level*
• Business English
• Academic writing
• ₺200/hour

🏆 *Advanced Level*
• Fluent speaking
• IELTS/TOEFL preparation
• ₺200/hour

*Package Prices:*
• 4 lessons: ₺750 (₺50 discount)
• 8 lessons: ₺1400 (₺200 discount)

Which level interests you? 🤔`;
            }
        }

        // Level Test
        if (msg.includes('3') || msg.includes('test') || msg.includes('seviye')) {
            this.userStates.set(from, { ...userState, step: 'level_test' });
            
            if (language === 'tr') {
                return `📝 *Hızlı Seviye Testi*

Lütfen aşağıdaki soruyu İngilizce cevaplayın:

*Soru:* "What do you usually do in your free time, and why do you enjoy these activities?"

Bu soruya İngilizce cevap vererek seviyenizi değerlendirebilirim! 🎯

*İpucu:* En az 2-3 cümle ile cevaplamaya çalışın.`;
            } else {
                return `📝 *Quick Level Assessment*

Please answer the following question in English:

*Question:* "What do you usually do in your free time, and why do you enjoy these activities?"

Answer this question so I can assess your level! 🎯

*Tip:* Try to answer with at least 2-3 sentences.`;
            }
        }

        // Schedule
        if (msg.includes('4') || msg.includes('program') || msg.includes('schedule') || msg.includes('zaman')) {
            if (language === 'tr') {
                return `📅 *Ders Programı*

*Müsait Saatler:*
📞 Pazartesi - Cuma: 09:00 - 21:00
📞 Cumartesi: 10:00 - 18:00
📞 Pazar: Kapalı

*Ders Süresi:* 60 dakika
*Platform:* WhatsApp Video Call veya Zoom

Hangi gün ve saatte ders almak istiyorsunuz? 

Örnek: "Salı 14:00" 🕐`;
            } else {
                return `📅 *Class Schedule*

*Available Hours:*
📞 Monday - Friday: 09:00 - 21:00
📞 Saturday: 10:00 - 18:00
📞 Sunday: Closed

*Lesson Duration:* 60 minutes
*Platform:* WhatsApp Video Call or Zoom

Which day and time would you like your lesson?

Example: "Tuesday 14:00" 🕐`;
            }
        }

        // Contact Teacher
        if (msg.includes('5') || msg.includes('öğretmen') || msg.includes('teacher') || msg.includes('görüşme')) {
            if (language === 'tr') {
                return `👨‍🏫 *Öğretmenle Görüşme*

Merhaba! Ben Hadi, İngilizce öğretmeninizim. 

📞 *İletişim:*
• WhatsApp: Bu numara
• E-posta: hadi@hadichat.com

🎓 *Deneyimim:*
• 5+ yıl İngilizce öğretmenliği
• TESOL sertifikalı
• Türk öğrenciler konusunda uzman

Size nasıl yardımcı olabilirim? Hemen yazabilirsiniz! 😊

*Ücretsiz 15 dakikalık tanışma görüşmesi istiyorsanız "DEMO" yazın.*`;
            } else {
                return `👨‍🏫 *Meet Your Teacher*

Hello! I'm Hadi, your English teacher.

📞 *Contact:*
• WhatsApp: This number
• Email: hadi@hadichat.com

🎓 *Experience:*
• 5+ years teaching English
• TESOL certified
• Expert with Turkish students

How can I help you? Feel free to write! 😊

*Type "DEMO" for a free 15-minute introduction call.*`;
            }
        }

        // Demo Request
        if (msg.includes('demo')) {
            if (language === 'tr') {
                return `🎉 *Ücretsiz Demo Dersi*

Harika! Size ücretsiz 15 dakikalık tanışma dersi ayarlayalım.

📅 *Müsait Zamanlar (Bu Hafta):*
• Yarın 14:00-15:00
• Yarın 19:00-20:00
• Salı 10:00-11:00
• Salı 16:00-17:00

Hangi saati tercih edersiniz? 

Demo dersinde:
✅ Seviyenizi belirleyeceğiz
✅ Öğrenim hedeflerinizi konuşacağız
✅ Size özel program hazırlayacağız

*Sadece saati seçin, onaylayacağım!* 🎯`;
            } else {
                return `🎉 *Free Demo Lesson*

Great! Let's schedule your free 15-minute introduction lesson.

📅 *Available Times (This Week):*
• Tomorrow 14:00-15:00
• Tomorrow 19:00-20:00
• Tuesday 10:00-11:00
• Tuesday 16:00-17:00

Which time do you prefer?

In the demo lesson:
✅ We'll assess your level
✅ Discuss your learning goals
✅ Create a personalized program

*Just choose the time, I'll confirm!* 🎯`;
            }
        }

        // Level Test Response Analysis
        if (userState.step === 'level_test' && message.length > 50) {
            const wordCount = message.split(' ').length;
            const hasComplexSentences = message.includes('because') || message.includes('however') || message.includes('although');
            const grammarScore = this.analyzeGrammar(message);
            
            let level, nextStep;
            if (wordCount < 20 || grammarScore < 3) {
                level = 'Beginner';
                nextStep = 'Başlangıç seviyesi kursumuz size uygun!';
            } else if (wordCount < 50 || grammarScore < 7) {
                level = 'Intermediate';
                nextStep = 'Orta seviye kursumuz ile gelişiminizi hızlandırabilirsiniz!';
            } else {
                level = 'Advanced';
                nextStep = 'İleri seviye kursumuz ile akıcılığınızı mükemmelleştirebilirsiniz!';
            }

            if (language === 'tr') {
                return `🎯 *Seviye Değerlendirmesi Tamamlandı*

*Sonucunuz:* ${level} seviyesi

*Değerlendirme:*
• Kelime sayısı: ${wordCount}
• Gramer puanı: ${grammarScore}/10
• ${nextStep}

*Bir sonraki adım:*
Demo dersi için "DEMO" yazın veya
Kurs bilgisi için "1" yazın

Başka sorunuz var mı? 😊`;
            } else {
                return `🎯 *Level Assessment Complete*

*Your Result:* ${level} level

*Assessment:*
• Word count: ${wordCount}
• Grammar score: ${grammarScore}/10
• ${nextStep}

*Next step:*
Type "DEMO" for demo lesson or
Type "1" for course information

Any other questions? 😊`;
            }
        }

        // Default helpful response
        if (language === 'tr') {
            return `🤔 Anlayamadım, size nasıl yardımcı olabilirim?

📚 *Hızlı Seçenekler:*
• "1" - Kurs bilgileri
• "DEMO" - Ücretsiz ders
• "FIYAT" - Fiyat listesi
• "ZAMAN" - Ders saatleri

Ya da sorunuzu açık bir şekilde yazabilirsiniz! 😊`;
        } else {
            return `🤔 I didn't understand, how can I help you?

📚 *Quick Options:*
• "1" - Course information
• "DEMO" - Free lesson
• "PRICE" - Price list
• "SCHEDULE" - Class times

Or feel free to write your question clearly! 😊`;
        }
    }

    analyzeGrammar(text) {
        let score = 0;
        if (text.includes('.') || text.includes('!') || text.includes('?')) score += 2;
        if (text.match(/[A-Z][a-z]/)) score += 1;
        if (text.includes('and') || text.includes('but') || text.includes('because')) score += 2;
        if (text.match(/ing\b/)) score += 1;
        if (text.match(/ed\b/)) score += 1;
        if (text.match(/\b(the|a|an)\b/)) score += 1;
        if (text.match(/\b(is|are|was|were)\b/)) score += 2;
        return Math.min(score, 10);
    }
}

const hadiBot = new HadiChatBot();

// WhatsApp Webhook
app.post('/webhook', (req, res) => {
    const from = req.body.From;
    const body = req.body.Body;
    
    console.log(`Message from ${from}: ${body}`);
    
    const response = hadiBot.generateResponse(body, from);
    
    client.messages.create({
        body: response,
        from: req.body.To, // Your WhatsApp number
        to: from
    }).then(message => {
        console.log('Response sent:', message.sid);
        res.status(200).send('OK');
    }).catch(err => {
        console.error('Error:', err);
        res.status(500).send('Error');
    });
});

// Health check
app.get('/', (req, res) => {
    res.send(`
        🎓 HadiChat WhatsApp Bot
        ✅ Bot is running!
        📱 WhatsApp: +19793987866
        🚀 Ready for English tutoring conversations
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 HadiChat server running on port ${PORT}`);
});

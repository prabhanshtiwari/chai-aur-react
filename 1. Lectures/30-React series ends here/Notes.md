# React Series — Final Video Notes (Chai aur Code)

## 1. Celebrating the Journey

- The series started with just **basic JavaScript knowledge** — no business logic, no in-depth React.
- Now, after completing the series, your knowledge has **significantly improved**.
- **The real goal of any course** (paid or free) is simple: did your knowledge improve? If yes → goal achieved ✅
- Hype should come at the **end** of a series, not the beginning — because finishing is the real achievement.

---

## 2. What React Actually Is (Core Purpose)

> Don't overcomplicate it. React has one job.

React is a **frontend library**. Its entire purpose is:

1. **Get data from the backend** (via API calls)
2. **Display that data** — as fast and as optimized as possible
3. **Send user data back** to the backend in an optimized way

That's it. Nothing more, nothing less.

---

## 3. Is This Series "Complete"?

**Short answer: No — and that's normal.**

No course, book, or tutorial (paid or free) can ever be 100% complete. React is too wide and too deep.

### Things NOT covered — and why it's okay:

| Topic | Why It Was Skipped |
|---|---|
| **Class-based Components** | Outdated. All modern projects use functional components. Legacy knowledge — not worth 2-3 hours of video. |
| **Every possible Hook** | You've learned to build **custom hooks** — so you can read docs and learn any hook on your own. |
| **Formik** | React Hook Form was covered. Same concept, different library. Read the docs. |
| **Zustand / Jotai** | Redux Toolkit + Context API were covered. The **concept** of state management is what matters — library names change. |
| **React Query / TanStack Query** | Same idea — once you understand data fetching, reading docs for any library is easy. |
| **Server Components (RSC)** | Requires a **server** — better learned in the **Next.js series** where SSR/SSG actually makes sense. |

### The Key Insight
> **Concepts > Library Names**

Once you understand *why* something is done (e.g., why we need global state), switching between Zustand, Redux, or Jotai is just reading documentation. The underlying idea is the same.

---

## 4. Avoid Tutorial Hell

⚠️ A very important warning:

- Don't fall into the trap of "I need to learn every single thing in React before I start building."
- What you know **right now is more than enough** for industry-level work.
- More knowledge than many working professionals have.

### The Right Mindset
```
Learn concept → Build project → Hit a problem → Learn what you need → Repeat
```

Not:
```
Watch every tutorial → Learn every hook → Learn every library → Never build anything
```

---

## 5. What to Do Next

### Primary Goal: Build Projects

Stop watching tutorials for new things. Start **building**:

- Recreate the blog app from scratch (without watching the video)
- Use the **freeapi.app** open source backend to build new apps
- Build a Twitter clone, Instagram clone, or e-commerce frontend

### The Open Source Project (freeapi.app)
- Has public APIs for: jokes, products, books, quotes, dogs, cats, YouTube videos, playlists
- Also has a full **social media backend**: profiles, posts, likes, comments, bookmarks
- All free, all open source — use it to practice real-world frontend development

---

## 6. What's Coming Next

The series ending doesn't mean videos stop. More content is planned:

- **Advanced projects** (higher-end, like those on freeCodeCamp / English channel)
- **More videos added** to the React series (e.g., legacy class components overview)
- **Next.js series** — where Server Side Rendering (SSR), Server Components, etc. will be properly covered
- **JavaScript series** will also get more additions

---

## 7. React Server Components — Why Not Here?

Many asked: *"Sir, we didn't cover React Server Components!"*

Here's why it was intentionally skipped:

- Server Components require an **actual server** to run
- Learning them in isolation (without a framework) gives you no real benefit
- The right place to learn them is **Next.js**, where the full picture (SSR, SSG, ISR) makes sense
- This series was focused on **pure React** — client-side, fundamentals first

---

## 8. Using GitHub to Debug Your Code

A practical tip often overlooked:

```bash
# If your code has errors and you can't find why:
# 1. Go to the course GitHub repo
# 2. Compare your file with the instructor's file line by line
# 3. The error is usually in a file you didn't expect

# Common scenario:
# "I wrote exactly the same code!" → You probably didn't.
# A comma, a missing import, or a typo in another file is the culprit.
```

- All course code is available on GitHub — free, open, no charges
- Compare your code with the repo whenever you're stuck
- Community on Discord can also help

---

## 9. Community Support

- Join the **Discord community** — people are actively helping each other
- If someone helped you learn React, **pay it forward** — help others with their doubts
- The instructor also posts React/JS updates in the community

---

## 10. Final Takeaways

| Lesson | Summary |
|---|---|
| **Goal of learning** | Improve knowledge — not reach "completion" |
| **React's job** | Fetch data → Display fast → Send data back |
| **Tutorial hell** | Avoid it — build projects instead |
| **Missing topics** | All intentional — concepts matter more than library names |
| **Server Components** | Learn in Next.js series, not here |
| **Next steps** | freeapi.app → build projects → LinkedIn/portfolio |
| **Class components** | Legacy — not worth deep diving yet |
| **Custom hooks** | You can learn any hook now — you understand the pattern |

---

## 11. Series Completion Checklist

Use this to gauge where you stand:

- [ ] Can you build a full authentication flow (signup, login, logout)?
- [ ] Can you manage global state with Redux Toolkit or Context?
- [ ] Can you set up React Router with protected routes?
- [ ] Can you perform CRUD operations against a backend?
- [ ] Can you handle file/image uploads?
- [ ] Can you write and use custom hooks?
- [ ] Can you rebuild the blog app from scratch — without help?

If most boxes are checked → **you're ready to build real projects.** 🎉

---

> *"Chai peete rahiye aur milte rahiye code pe."*
> — Keep drinking chai and keep meeting on code.

<!-- Transcript:

```
हां जी कैसे हैं आप स्वागत है आपका चाय और
कोड में हमारा अनोखा चैनल और यह वीडियो है
हमारी रिएक्ट की सीरीज का आखिरी वीडियो यह
रिएक्ट की सीरीज खत्म करने से पहले मैंने
सोचा कि आपसे थोड़ी सी बात कर लें कुछ
चर्चा कर लें ताकि आपको भी एक पूरा आईडिया
रहे कि कहां से हम स्टार्ट हुए थे कहां पे
पहुंच गए किस चीज का हमें जश्न बनाना
चाहिए और किस चीज को ओवर हाइप नहीं करना
चाहिए तो अक्सर ऐसी सीरीज में हाइप होती
है कि देखिए हमने सीरीज लॉन्च कर दी है
स्टार्ट कर दी है लेकिन मुझे लगता है कि
हाइप तब मचानी चाहिए जब सीरीज खत्म हो जाए
और यह हमारा फाइनल वीडियो है रिएक्ट की
सीरीज में अगर आपको याद हो तो हमने सीरीज
स्टार्ट करी थी बस हमें बेसिक्स ऑफ
जावास्क्रिप्ट आता था कोई बिजनेस लॉजिक
नहीं बनाने आते थे कोई रिएक्ट का इन डेप्थ
कुछ नहीं पता था और आज हम जिस पोजीशन पे
हैं अगर वह पोजीशन पहले की तुलना में
ज्यादा इंप्रूव्ड है अभी ज्यादा बेहतर है
आप नॉलेज में तो मतलब गोल सेट हो गया है
इस गोल अचीव हो गया है हमारी सीरीज का अब
हो सकता है आपको कंप्लीट सीरीज ना समझ में
आई हो हो सकता है एक रिवीजन दोबारा दोबारा
से लगे हो सकता है कुछ प्रोजेक्ट दोबारा
से खुद बनाने पड़े या हो सकता है इसके
अलावा भी कुछ प्रोजेक्ट बनाने पड़े बट गोल
यह है कि क्या हमारी नॉलेज में इजाफा आया
है अगर हमारी नॉलेज इंप्रूव हुई है तो बस
यही तो गोल होता है हमेशा कि सीरीज कुछ भी
पढ़े कहीं से भी पढ़े पेड कोर्स हो फ्री
कोर्स हो नॉलेज में इंप्रूवमेंट आना चाहिए
बस मेरा गोल यही होता है हमेशा तो उम्मीद
करता हूं वो गोल आपका भी सक्सेसफुल रहा हो
अब सबसे जरूरी बात यह जो सीरीज है यह वन
ऑफ दी बेस्ट इंटरनेट की सीरीज है आपने
ऑलरेडी देख लिया है कितने एफर्ट गए हैं इस
सीरीज के अंदर कि ना इंडस्ट्री लेवल
प्रोडक्शन लेवल कोड इसके अंदर लिखा गया है
इन कोड को और आसान किया जा सकता था बड़े
ही बेसिक तरीके से लिखा जा सकता था लेकिन
वहां पे कुछ अच्छी प्रैक्टिसेस हम फॉलो
नहीं करते और फिर इंडस्ट्री में आप जाते
हैं तो वहां पे होती है आपको प्रॉब्लम हो
सकता है चीजें आपको और आसान लगती लेकिन
गोल ये नहीं है ना कि चीजों को इतना आसान
कर दो कि बस वो इंडस्ट्री स्टैंडर्ड से ही
हट जाए हो सकता है कुछ चीजें डिफिकल्ट हो
लेकिन डिफिकल्टी में भी हमारी भलाई है
इसलिए चीजों को थोड़ा सा इंडस्ट्री
स्टैंडर्ड रखा गया थोड़ा सा क्या कंप्लीट
इंडस्ट्री स्टैंडर्ड रखा गया है कुछ
दोस्तों ने तो ये भी मैसेज किया तो इतना
तो हम इंडस्ट्री के अंदर भी स्टैंडर्ड
फॉलो नहीं कर रहे जितना तुमने सीरीज में
फॉलो किया है बट अच्छी प्रैक्टिसेस फॉलो
करना जरूरी है तो इस वीडियो के साथ हमारी
रिएक्ट की सीरीज होती है खत्म लेकिन सबसे
जरूरी बात कुछ मैंने अपने टॉपिक्स लिख रखे
हैं जो ओबवियस सी बात है आपके क्वेश्चंस
होंगे और वो क्वेश्चंस के मैं आंसर करना
चाहता हूं इस सीरीज के अंदर सबसे पहली बात
जर्नी में मुझे बहुत मजा आया आपको भी
उम्मीद करता हूं मजा आया होगा मेरा गोल यह
था कि नेक्स्ट जो मैं देश घूमने जा रहा
हूं हां जी नेक्स्ट देश का वीजा आ गया है
तो वो भी घूमने जा रहे हैं बाकी अपडेट में
आपको मेरे
whatsapp.wap बेहतर बनाना है तो जितना मजा
आपको आया उतना ही मजा मुझे भी आया जर्नी
का ही तो फन है लेकिन इंपॉर्टेंट बात अब
इसके बाद क्या करना है देखिए रिएक्ट जो है
ना वो एक फ्रंट एंड लाइब्रेरी है और फ्रंट
एंड का मेजर जो काम होता है वह यह होता है
कि बैक एंड से हम डेटा लें और उस डेटा को
अच्छे से अच्छे फास्ट से फास्ट ऑप्टिमाइज
तरीके से डिस्प्ले करवाएं ताकि यूजर को
कोई प्रॉब्लम ना आए अगर यूजर से कोई डाटा
हमें लेना है तो उसको बैक एंड पे हम बहुत
ही ऑप्टिमाइज तरीके से पहुंचा दें यही गोल
है रिएक्ट का और यही काम है रिएक्ट का
इससे ज्यादा कुछ भी नहीं है अब हो सकता है
आप उस लूप होल के अंदर पढ़ जाओ या
ट्यूटोरियल हेल के अंदर पढ़ जाओ कि मुझे
तो हर एक पॉइंट हर एक चीज सीखनी है रिएक्ट
की जो आपको जरूरत ही नहीं है प्रोजेक्ट के
हिसाब से चीजों को सीखा जाता है जितना अभी
आपको इस सीरीज के अंदर नॉलेज है वो मोर
देन इनफ है उतना तो इंडस्ट्री के अंदर भी
नहीं है नॉलेज तो आप उसमें मत जाइए चीजों
को जितना आप सीख चुके हैं उतना ही आपके
लिए बहुत है इसके अलावा लास्ट वीडियो जो
असाइनमेंट वाला था उसके अंदर मैंने आपको
बता दिया कि अगर आपको और खुद से प्रैक्टिस
करनी है तो हमारा ओपन सोर्स प्रोजेक्ट जो
है फ्री एपीआई वहां पे बहुत सारी एपीआई
बनी हुई रखी है उनको और प्रैक्ट प्रिस
करिए अब सीरीज खत्म हो गई तो इसका मतलब यह
तो नहीं है कि मैं आगे वीडियो ही नहीं
डालूंगा इसमें ओबवियस सी बात है अब तो
हमारा बेस लाइन सेट हुआ है अब जो हायर एंड
के प्रोजेक्ट्स हैं जो मैं इंग्लिश चैनल
वगैरह पे बनाता हूं फ्री कोड कैम वगैरह पे
देता हूं वो सब अब हम यहां पे भी डाल सकते
हैं क्योंकि अब प्रोजेक्ट्स ही
प्रोजेक्ट्स डालने हैं अब हमारा बेसिक्स
तो रिएक्ट का हो गया जावास्क्रिप्ट का हो
जाए तो इस सेक्शन में हमें प्रोजेक्ट्स के
बारे में डील करेंगे आगे भी वीडियो ऐड
होंगे इस सीरीज में भी ऐड होंगे
जावास्क्रिप्ट वाली सीरीज में भी ऐड होंगे
काफी वीडियोस ऐड होंगे तो प्रैक्टिस करते
रहिएगा और रिएक्ट को आगे प्रोजेक्ट के
थ्रू ही सीखेगा ट्यूटोरियल हेल में नहीं
पढ़ना है अब अब कुछ ना कुछ जो खुद क्रिएट
करेंगे या फिर इस सीरीज के अंदर जो
प्रोजेक्ट है उनको हम रीक्रिएट करेंगे
दोबारा से तो उन पे हम काम करेंगे एक
दूसरा अ क्वेश्चन जो आपके सामने अक्सर
आएगा कि क्या यह सीरीज कंप्लीट है जितना
भी होता है रिएक्ट में सब कुछ हो गया है
नहीं जी ऐसा नहीं है ऐसा हो भी नहीं सकता
है आप कोई भी बुक पढ़ेंगे कोई भी कोर्स
देखेंगे पेड हो या फ्री हो वहां पे
कंप्लीट किसी भी चीज का होना ऑलमोस्ट
इंपॉसिबल है चीजें इतनी ज्यादा इन डेप्थ
है इतनी ज्यादा वाइड स्प्रेड है और इतने
ज्यादा यूज केसेस हैं कि कोई भी अगर यह
सोच रहा है कि मुझे कंप्लीट सिखा दो बस
जितना पॉसिबल है सब कुछ अ तो देखिए यह तो
पॉसिबल है नहीं यह तो आप गलत धारणा लेके
चल रहे हैं जिसका कोई सेंस नहीं है आगे
जाके आप ही परेशान होंगे तो प्लीज ऐसा मत
करिए अब कई लोग कहेंगे सर क्या क्लास बेस
कंपोनेंट पे बात करी हमने सर ये वाला एक
स्पेशल हुक ही रह गया है सर जें के बारे
में बात नहीं करिए सर हमने यूज रिएक्ट
फॉर्म तो बात करी है यहां पे रिएक्ट हुक
फॉर्म्स तो बात करी है लेकिन फॉर्मिक पे
बात नहीं करी है देखिए इस तरह की काफी
चीजें मैं भी आपके सामने और रख सकता हूं
लेकिन उनका कोई महत्व नहीं है क्योंकि
क्लास बेस कंपोनेंट पहली बात तो 4-5 साल
पहले जितने भी सीरीज बनी है या जितने भी
प्रोजेक्ट्स बने हैं उन सब में फंक्शनल
कंपोनेंट है इन केस अगर आपको किसी लेगासी
प्रोजेक्ट में काम करना है या उसका फ्लो
समझना है तो आगे जाके हम कुछ वीडियोस ऐड
कर लेंगे जहां पे हम चर्चा कर लेंगे वैसे
इसकी चर्चा हमने हमारे जावास्क्रिप्ट
सीरीज के दिस सेक्शन में भी करी थी जहां
पे हम बाइंडर पढ़ रहे थे तो आगे जाके हम
कर लेंगे लेकिन उसके अंदर एकदम इन डेप्थ
जाना सिर्फ वो क्लास बेस देखिए लेगे स
चीजों को पढ़ने में इतिहास पढ़ने में
कहानियां सुनने में मजा तो सबको आता है
लेकिन क्या अब उसका उतना महत्व है कि हम
एक 2 घंटा 3 घंटे की वीडियो उसी पर
डेडिकेट करें मुझे तो नहीं लगता जस्ट एक
बेसिक ओवरव्यू आपको पता है तो ठीक है नहीं
पता है तो भी कोई दिक्कत नहीं है उसके
अलावा हुक्स देखिए हुक्स जब मैंने आपको
कस्टम हुक्स बनाना ही सिखा दिया है तो अब
आप किसी भी हुक का थोड़ा सा डॉक्यूमेंटेशन
पढ़ के अगर नहीं कर पा रहे हैं तो एक बार
सोचिए दोबारा से या सही से पढ़ रहे हैं या
सही लाइन के अंदर तो हैं हम क्योंकि हुक्स
तो बहुत सारे हैं और और भी हो सकते हैं
कोई ना कोई आएगा जंड के अलग हुक्स होते
हैं या फिर अगर आप रिडक्स टूल किट यूज़
करते हैं उसके अलग हुक्स हैं रिएक्ट
क्वेरी यूज़ करते हैं उसके अलग हुक्स हैं
तो सबके अपने-अपने यूज केसेस हैं उसके
अलावा आपको कई लोग कहेंगे अच्छा उस सीरीज
के अंदर रिएक्ट क्वेरी नहीं हुआ अरे फिर
कैसे सीरीज कंप्लीट हो गई अरे उस सीरीज
में जस्ट स्टैंड ही नहीं हुआ फिर कैसे
सीरीज कंप्लीट हो गई नहीं देखिए सीरीज
कंप्लीट है इसमें हमने स्टेट मैनेजमेंट की
बात करी है जिस तरह से रिडक्स टूल किट काम
करता है कॉन्टेक्स्ट एपीआई यूज़ करता है
ऐसे 10 और लाइब्रेरीज हैं जो भी हर किसी
का अपना-अपना फेवरेट है लेकिन अगर बेस
कांसेप्ट समझ में आ गया है कि प्रॉप्स को
कैसे पास करने के लिए डाटा को कैसे पास
करने के लिए हमारे पास ये चीजें होती है
तो अब उसका नाम जैंड हो या फिर कल एक नई
लाइब्रेरी लांच हो जाए क्या फर्क पड़ता है
हम पढ़ के डॉक्यूमेंटेशन कर लेंगे आराम से
और हमने यह सब इसी तरह से सीखा है तो
चीजों को इतना ज्यादा इन डेप्थ मत देखिए
कि हमें कभी सीरीज से बाहर ही नहीं निकल
पाए क्योंकि याद रखिए ये सिर्फ टूल्स हैं
टूल्स का काम होता है एक प्रोजेक्ट बनाना
तो टूल्स हमें बेसिक आईडिया हो चुका है
नॉलेज हो चुकी है अब उसके अंदर और रैबिट
होल में अगर जाते जाएंगे तो आप कभी एक्ट
से बाहर नहीं निकलेंगे कभी कॉन्फिडेंस
नहीं आएगा अब जो कहानी है वह है
प्रोजेक्ट्स बनाने की अच्छे प्रोजेक्ट्स
बनाइए कम्युनिटी सपोर्ट है डिस्कॉर्डेंट
लीजिए और कुछ अच्छा सा बिल्ड करिए और बाकी
हम तो प्रोजेक्ट लेके आएंगे ही उसमें तो
कोई बात नहीं है अच्छा एक और चीज सबसे
इंपॉर्टेंट कम्युनिटी अ देखिए कम्युनिटी
ऑलरेडी काफी अच्छी है लोग एक दूसरे की
काफी हेल्प कर रहे हैं आप भी अगर चाहते
हैं तो जवाइन कर लीजिए
h.s. a
कुछ और रिएक्ट में नया हुआ है या कुछ इस
तरह से हुआ है तो वो भी मैं अपडेट वहां पे
डालता जाऊंगा और वह काम करेंगे अच्छा इससे
याद आया एक और चीज कई लोग कहेंगे सर
रिएक्ट के अंदर सर्वर कंपोनेंट्स तो हमने
देखे ही नहीं यहां पे देखने भी नहीं चाहिए
क्योंकि सर्वर कंपोनेंट्स के लिए सर्वर
लगता है सर्वर समझते हैं हां जी रिएक्ट क
सर्वर साइड के लिए सर्वर लगता है अब ये
चीज जो टॉपिक है वो पढ़ना ज्यादा बेहतर
होता है हमारी नेक्स्ट यस की सीरीज
ऑफकोर्स सी बात है वो भी आएगी वहां पे
पढ़े या फिर जब हमारे पास एक्सप्रेस वगैरह
का नॉलेज हो गया है सर्वर तो चाहिए ना
सर्वर साइट पढ़ने के लिए रिएक्ट में बस
उसका बेसिक अगर देख लेंगे कोई फायदा नहीं
है ज्यादा बेहतर है हम इंप्लीमेंटेशन साइड
देखें इन चीजों का कि एसएसआर सर्वर साइड
रेंडरिंग ये सब क्या होता है जब एक्चुअली
में उसका हम फ्रेमवर्क यूज़ करें नेक्स्ट
यस वगैरह में तो ये चीजें वहां पे
कंटिन्यू होगी यहां पे प्योर रिएक्ट है हम
प्योर रिएक्ट के ऊपर थे तो उसी में हम काम
करेंगे अच्छा एक चीज और है कुछ नोट्स
वगैरह के बारे में मुझे बात करनी थी वो
मैं एक सेपरेट वीडियो में आपके साथ बात
करूंगा अभी सिर्फ इतना है कम्युनिटी है
डिस्कार्ड पे लोग एक दूसरे की बहुत हेल्प
कर रहे हैं आपका भी मेन गोल यही है कि
कम्युनिटी में हम लोगों की हेल्प करें कर
जैसे मैंने हेल्प करी आपकी एक ट्यूटोरियल
सीखने में पूरा रिएक्ट सीखने में आप हेल्प
कीजिए लोगों को अगर कहीं कोई डाउट है कुछ
है गेट हब पे सारा कोड अवेलेबल है गट हब
से कोड लीजिए उसको कंपेयर कीजिए अपने कोड
पे हो सकता है आप कुछ एरर्स ले रहे हो गेट
हब पे वो एरर्स नहीं है सारी रिजॉल्व कर
दी गई है उनको कंपेयर कीजिए एक दूसरे की
हेल्प करिए कई बार ऐसा लगता है कि अरे मैं
तो एगजैक्टली वही लिख रहा हूं जो आप लिख
रहे हैं बट ऐसा नहीं होता है कुछ ना कुछ
मिस्टेक है किसी और फाइल में मिस्टेक है
बट इस तरह से है तो काफी अच्छा सफर रहा
काफी अच्छी चर्चा भी हमने कर ली एक फाइनल
वीडियो के अंदर हम हमारे एंड वीडियो के
अंदर तो उम्मीद करता हूं इससे आपको एक
अच्छा ओवरव्यू मिला होगा कि कहां पे हमने
स्टार्ट करा कहां पे हमने एंड करा आगे
जाके और क्या करना है सपोर्ट इस तरह से
बनाए रखिएगा काफी अच्छा मजा आया आप लोगों
ने बहुत सपोर्ट दिखाया बहुत मोटिवेशन दिया
मुझे और तभी शायद ये सीरीज खत्म हो पाई तो
थैंक यू सो मच उस सबके लिए और सीरीज के
एंड में ही अब हम सेलिब्रेट करें उसका
हाइप करें तो ज्यादा अच्छा है ओबवियस सी
बात है अब थोड़ा सा प्रमोशन हम भी करेंगे
इन सीरीज का जावास्क्रिप्ट का और रिएक्ट
का क्योंकि अब खत्म हो गई है तो अब तो
प्रमोशन बनता ही है है कि नहीं चलिए तो
कोई कमेंट का गोल गल नहीं है इस वीडियो के
अंदर बस तहे दिल से आपका शुक्रिया कि आपने
इतना सपोर्ट दिखाया जितना मन करे कमेंट कर
दीजिए अगर एक भी नहीं करेंगे तो भी कोई
दिक्कत वाली बात नहीं है आपने ऑलरेडी बहुत
सपोर्ट दिखाया है थैंक यू सो मच इसके लिए
और तैयारी कर लीजिए बकल अप कर लीजिए और
सीरीज आ रही है इससे भी ज्यादा इन डेप्थ
जाएंगे और इंडस्ट्री स्टैंडर्ड पढ़ेंगे
ठीक है चलिए चाय पीते रहिए और मिलते रहिए
कोड
पे
```

make notes in english in md format.
never miss any point
explain things easily
also use comments in code(if available) -->
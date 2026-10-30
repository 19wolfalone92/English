import json
from pathlib import Path

# Every pair contains one natural Russian meaning and one idiomatic English equivalent.
# Pipe-delimited for straightforward human review; no machine translation.
LESSONS = [
('A2', 'Ежедневные привычки', '''Я обычно встаю рано.|I usually get up early.
Я завтракаю перед работой.|I have breakfast before work.
Она пьёт чай по утрам.|She drinks tea in the morning.
Мы часто гуляем после ужина.|We often go for a walk after dinner.
Я редко смотрю телевизор.|I rarely watch TV.
Я отдыхаю по выходным.|I relax on weekends.
Что ты обычно делаешь вечером?|What do you usually do in the evening?
Я иногда ложусь спать поздно.|I sometimes go to bed late.
Он каждый день ездит на работу.|He goes to work every day.
Я всегда проверяю свой календарь.|I always check my calendar.'''),
('A2','Общение и вопросы', '''Как прошёл твой день?|How was your day?
Что ты сейчас делаешь?|What are you doing right now?
Можешь повторить, пожалуйста?|Could you repeat that, please?
Я не расслышал последнее слово.|I didn't catch the last word.
Как это сказать по-английски?|How do you say this in English?
Мне нужно немного подумать.|I need a moment to think.
Ты можешь говорить медленнее?|Could you speak more slowly?
Я не совсем понял вопрос.|I didn't quite understand the question.
Расскажи мне об этом подробнее.|Tell me more about it.
А что думаешь ты?|What do you think?'''),
('A2','Дом и отдых', '''Я лежу на диване.|I'm lying on the sofa.
Мне хочется немного поспать.|I feel like taking a nap.
Сейчас я слушаю музыку.|I'm listening to music right now.
В комнате слишком жарко.|It's too hot in the room.
Пожалуйста, закрой окно.|Please close the window.
Я хочу приготовить ужин.|I want to cook dinner.
Мы можем посмотреть фильм вместе.|We can watch a movie together.
Где лежат мои ключи?|Where are my keys?
Мне нужно убраться в комнате.|I need to clean my room.
Я люблю проводить время дома.|I enjoy spending time at home.'''),
('A2','Еда и покупки', '''Я хочу заказать обед.|I'd like to order lunch.
Сколько это стоит?|How much does it cost?
У вас есть что-нибудь без мяса?|Do you have anything without meat?
Я предпочитаю кофе без сахара.|I prefer coffee without sugar.
Можно посмотреть меню?|Could I see the menu?
Это блюдо очень вкусное.|This dish is delicious.
Я бы хотел заплатить картой.|I'd like to pay by card.
Нам нужен список покупок.|We need a shopping list.
В магазине сегодня скидки.|There are discounts at the store today.
Можно счёт, пожалуйста?|Could we have the bill, please?'''),
('A2','Город и транспорт', '''Как добраться до вокзала?|How can I get to the train station?
Автобус остановится здесь?|Will the bus stop here?
Это место недалеко от центра.|This place is not far from the city center.
Поверни направо на следующей улице.|Turn right at the next street.
Я хочу посетить красивый парк.|I want to visit a beautiful park.
Мы можем поехать на метро.|We can take the subway.
Сколько времени займёт дорога?|How long will the journey take?
Где ближайшая остановка?|Where is the nearest bus stop?
Я заблудился в городе.|I got lost in the city.
Давай встретимся у входа.|Let's meet at the entrance.'''),
('A2','Прошедшее время', '''Вчера я много работал.|I worked a lot yesterday.
В прошлые выходные мы ездили в гости.|We visited friends last weekend.
Я забыл свой телефон дома.|I forgot my phone at home.
Она прислала мне сообщение.|She sent me a message.
Мы хорошо провели время.|We had a great time.
Что ты делал вчера вечером?|What did you do last night?
Я не видел этот фильм.|I didn't see that movie.
Он купил новый ноутбук.|He bought a new laptop.
Я проснулся позже обычного.|I woke up later than usual.
Дождь начался внезапно.|It started raining suddenly.'''),
('A2','Планы и возможности', '''Завтра я собираюсь учить английский.|I'm going to study English tomorrow.
Мы можем встретиться вечером.|We can meet in the evening.
Я позвоню тебе позже.|I'll call you later.
Возможно, я останусь дома.|I might stay at home.
Я хочу научиться водить машину.|I want to learn to drive.
На выходных будет хорошая погода.|The weather will be nice this weekend.
Я собираюсь попробовать новое хобби.|I'm going to try a new hobby.
Ты сможешь помочь мне завтра?|Will you be able to help me tomorrow?
Мы могли бы сходить на прогулку.|We could go for a walk.
Я надеюсь увидеть тебя скоро.|I hope to see you soon.'''),
('A2','Сравнения и эмоции', '''Сегодня я счастливее, чем вчера.|I'm happier today than yesterday.
Этот фильм интереснее того.|This movie is more interesting than that one.
Английский становится легче.|English is getting easier.
Я чувствую себя немного уставшим.|I feel a little tired.
Мне нравится этот вариант больше.|I like this option better.
Это самый красивый вид здесь.|This is the most beautiful view here.
Я беспокоюсь о завтрашнем дне.|I'm worried about tomorrow.
Она говорит быстрее меня.|She speaks faster than I do.
Мне стало гораздо спокойнее.|I feel much calmer now.
У меня сегодня хорошее настроение.|I'm in a good mood today.'''),
('B1','Работа и карьера', '''Я ищу более высокооплачиваемую работу.|I'm looking for a better-paying job.
Знание английского откроет новые возможности.|Knowing English will open up new opportunities.
Мне нравится решать технические проблемы.|I enjoy solving technical problems.
Я отвечаю за безопасность оборудования.|I'm responsible for equipment safety.
Сегодня у нас было важное совещание.|We had an important meeting today.
Мне пришлось задержаться на работе.|I had to stay late at work.
Я хочу развивать профессиональные навыки.|I want to develop my professional skills.
Эта задача оказалась сложнее, чем я ожидал.|This task turned out to be harder than I expected.
Мне нужно закончить отчёт вовремя.|I need to finish the report on time.
Удалённая работа могла бы сэкономить время.|Working remotely could save time.'''),
('B1','Опыт и достижения', '''Я уже пробовал это раньше.|I've tried this before.
Ты когда-нибудь бывал за границей?|Have you ever been abroad?
Я ещё не закончил проект.|I haven't finished the project yet.
Она только что вернулась домой.|She's just got home.
Я учу английский уже несколько месяцев.|I've been learning English for several months.
Мы знакомы много лет.|We've known each other for years.
Это лучший совет, который я когда-либо получал.|That's the best advice I've ever received.
Я никогда не пробовал это блюдо.|I've never tried this dish.
Ты уже посмотрел этот сериал?|Have you watched this series yet?
За последнее время я многому научился.|I've learned a lot recently.'''),
('B1','Возможности и условия', '''Если будет дождь, мы останемся дома.|If it rains, we'll stay at home.
Если бы у меня было больше времени, я бы больше читал.|If I had more time, I'd read more.
Я бы позвонил тебе, если бы знал номер.|I'd call you if I knew the number.
Если смогу, я помогу тебе.|If I can, I'll help you.
Я смог бы приехать раньше при других обстоятельствах.|I could arrive earlier under different circumstances.
Если бы я умел телепортироваться, я бы путешествовал каждый день.|If I could teleport, I'd travel every day.
Мы опоздаем, если не поторопимся.|We'll be late if we don't hurry.
Я бы не стал этого делать на твоём месте.|I wouldn't do that if I were you.
Если понадобится помощь, дай мне знать.|If you need help, let me know.
Я мог бы объяснить это иначе.|I could explain it differently.'''),
('B1','Истории и события', '''Когда я пришёл, они уже ужинали.|When I arrived, they were already having dinner.
Пока я работал, мне позвонил друг.|While I was working, a friend called me.
Вдруг выключился свет.|Suddenly, the lights went out.
Я не ожидал такого результата.|I didn't expect that result.
Сначала всё шло по плану.|At first, everything went according to plan.
В конце концов мы нашли решение.|Eventually, we found a solution.
Он объяснил, что произошло.|He explained what had happened.
Я понял ошибку только вечером.|I only realized my mistake in the evening.
К счастью, никто не пострадал.|Fortunately, nobody was hurt.
Это оказался незабываемый день.|It turned out to be an unforgettable day.'''),
('B1','Доверие и общение', '''Я хочу лучше понять твою точку зрения.|I want to understand your point of view better.
Мы можем обсудить это спокойно.|We can talk about this calmly.
Я не хотел тебя обидеть.|I didn't mean to hurt you.
Мне нужно время, чтобы разобраться в чувствах.|I need time to sort out my feelings.
Мне важно, чтобы мы доверяли друг другу.|It's important to me that we trust each other.
Я ценю твою честность.|I appreciate your honesty.
Давай не будем делать поспешных выводов.|Let's not jump to conclusions.
Я понимаю, почему ты расстроена.|I understand why you're upset.
Мы можем решить проблему вместе.|We can work through the problem together.
Мне хотелось бы больше времени проводить вместе.|I'd like us to spend more time together.'''),
('B1','Путешествия и трудности', '''Наш рейс задержали на два часа.|Our flight was delayed by two hours.
Я хотел бы забронировать номер на две ночи.|I'd like to book a room for two nights.
Где можно обменять валюту?|Where can I exchange currency?
Я потерял багаж в аэропорту.|I lost my luggage at the airport.
Можешь порекомендовать местный ресторан?|Could you recommend a local restaurant?
Если поезд отменят, мы возьмём такси.|If the train is canceled, we'll take a taxi.
Я пытаюсь найти дорогу к отелю.|I'm trying to find my way to the hotel.
Эта поездка превзошла мои ожидания.|This trip exceeded my expectations.
Я предпочитаю путешествовать налегке.|I prefer to travel light.
Нам стоит заранее проверить расписание.|We should check the schedule in advance.'''),
('B1','Мнения и аргументы', '''На мой взгляд, это хорошая идея.|In my opinion, that's a good idea.
Я понимаю твою мысль, но не совсем согласен.|I see your point, but I don't entirely agree.
Главная причина в том, что это экономит время.|The main reason is that it saves time.
С другой стороны, это может быть дорого.|On the other hand, it might be expensive.
Я предпочёл бы сначала узнать больше.|I'd rather find out more first.
Это зависит от обстоятельств.|It depends on the circumstances.
Можешь привести пример?|Could you give me an example?
Я не уверен, что это сработает.|I'm not sure that will work.
Есть несколько способов решить эту проблему.|There are several ways to solve this problem.
Я склонен согласиться с тобой.|I tend to agree with you.'''),
('B1','Изучение и привычки', '''Я стараюсь заниматься понемногу каждый день.|I try to study a little every day.
Мне легче запоминать слова в контексте.|I find it easier to remember words in context.
Я привык читать перед сном.|I'm used to reading before bed.
Раньше я часто переводил каждое слово.|I used to translate every word.
Сейчас я начинаю думать по-английски.|I'm starting to think in English now.
Повторение помогает мне не забывать материал.|Reviewing helps me retain what I've learned.
Мне нужно больше практики в разговоре.|I need more speaking practice.
Я постепенно становлюсь увереннее.|I'm gradually becoming more confident.
Ошибки помогают мне учиться.|Making mistakes helps me learn.
Я хочу свободно выражать свои мысли.|I want to express my thoughts fluently.'''),
('B2','Нюансы и неопределённость', '''Насколько мне известно, решение ещё не принято.|As far as I know, no decision has been made yet.
Я не стал бы делать выводы без доказательств.|I wouldn't draw conclusions without evidence.
Вполне возможно, что мы неправильно поняли ситуацию.|It's entirely possible that we misunderstood the situation.
Это не обязательно означает, что всё потеряно.|That doesn't necessarily mean everything is lost.
Я бы предпочёл пока оставить вопрос открытым.|I'd prefer to leave the question open for now.
Нам следует учитывать несколько возможных объяснений.|We should consider several possible explanations.
Я не уверен, насколько надёжна эта информация.|I'm not sure how reliable that information is.
Было бы преждевременно утверждать обратное.|It would be premature to claim otherwise.
В отсутствие фактов лучше воздержаться от обвинений.|Without the facts, it's better to avoid accusations.
Вероятно, на решение повлияло несколько факторов.|Several factors probably influenced the decision.'''),
('B2','Сложные условия', '''Если бы я знал об этом раньше, я бы поступил иначе.|If I'd known about this earlier, I would have acted differently.
Если бы не твоя помощь, мы бы не справились.|If it hadn't been for your help, we wouldn't have managed.
При условии, что всё пойдёт по плану, мы закончим вовремя.|Provided everything goes according to plan, we'll finish on time.
Даже если бы мне предложили больше денег, я бы отказался.|Even if I were offered more money, I'd turn it down.
Если бы я лучше подготовился, сейчас я бы чувствовал себя увереннее.|If I'd prepared better, I'd feel more confident now.
На твоём месте я бы сначала обсудил это с командой.|If I were in your position, I'd discuss it with the team first.
Предположим, что у нас не будет интернета, как мы поступим?|Suppose we have no internet access. What would we do?
Если возникнут дополнительные трудности, сообщи мне.|Should any further difficulties arise, let me know.
Я бы хотел, чтобы мы обсудили это раньше.|I wish we'd discussed this earlier.
Если бы только я не торопился с выводами.|If only I hadn't jumped to conclusions.'''),
('B2','Профессиональное общение', '''Не могли бы вы уточнить требования к проекту?|Could you clarify the project requirements?
Мы должны убедиться, что система работает надёжно.|We need to ensure that the system operates reliably.
Основная проблема заключается в недостатке данных.|The main issue lies in the lack of data.
Я предлагаю проверить предположения прежде, чем действовать.|I suggest verifying our assumptions before taking action.
Мы столкнулись с непредвиденной технической неисправностью.|We encountered an unexpected technical fault.
Этот подход позволит снизить риск ошибок.|This approach will help reduce the risk of errors.
Давайте согласуем сроки выполнения.|Let's agree on a timeline for completion.
Следует тщательно задокументировать результаты испытаний.|The test results should be documented thoroughly.
Я бы хотел обратить ваше внимание на важную деталь.|I'd like to draw your attention to an important detail.
Нам потребуется дополнительная информация для оценки.|We'll need further information to make an assessment.'''),
('B2','Аргументация и дискуссия', '''С одной стороны, это удобно, но с другой — дорого.|On the one hand, it's convenient, but on the other, it's expensive.
Хотя этот подход имеет преимущества, у него есть и недостатки.|Although this approach has advantages, it also has drawbacks.
Я признаю твою точку зрения, однако вижу ситуацию иначе.|I acknowledge your point, but I see the situation differently.
Это утверждение требует дополнительных доказательств.|That claim requires further evidence.
Основной аргумент в пользу изменения — экономия времени.|The main argument in favor of the change is that it saves time.
Следует различать причины и последствия.|We should distinguish between causes and consequences.
Давай рассмотрим проблему с другой стороны.|Let's look at the issue from another perspective.
Убедительное объяснение не всегда означает верное объяснение.|A convincing explanation isn't always an accurate one.
В конечном счёте решение зависит от наших приоритетов.|Ultimately, the decision depends on our priorities.
Я готов пересмотреть мнение, если появятся новые факты.|I'm willing to reconsider my opinion if new evidence emerges.'''),
('B2','Сложные времена', '''К тому моменту, когда он приехал, встреча уже закончилась.|By the time he arrived, the meeting had already ended.
В следующем месяце я буду работать здесь уже пять лет.|By next month, I'll have been working here for five years.
Я уже несколько часов пытаюсь решить эту проблему.|I've been trying to solve this problem for hours.
Когда я вернулся, они обсуждали моё предложение.|When I returned, they were discussing my proposal.
Мы закончим испытания к пятнице.|We'll have finished the tests by Friday.
Я не знал, что он уже отправил отчёт.|I didn't realize he'd already sent the report.
Я собирался позвонить, но меня отвлекли.|I was going to call, but I got distracted.
Она сказала, что давно изучает этот вопрос.|She said she'd been studying the issue for a long time.
Это был первый раз, когда я столкнулся с такой ошибкой.|It was the first time I'd encountered that error.
К вечеру мы уже будем знать результаты.|By this evening, we'll know the results.'''),
('B2','Отношения и границы', '''Мне важно сохранять личное пространство в отношениях.|It's important to me to maintain personal space in a relationship.
Я хочу говорить о своих потребностях без обвинений.|I want to express my needs without making accusations.
Доверие требует времени и последовательных поступков.|Trust takes time and consistent actions.
Мы можем быть близки, не проводя вместе каждую минуту.|We can be close without spending every minute together.
Я признаю свою ответственность за сказанные слова.|I take responsibility for what I said.
Неопределённость не должна заставлять нас делать поспешные выводы.|Uncertainty shouldn't make us jump to conclusions.
Никто не обязан угадывать чувства другого человека.|No one should be expected to read another person's mind.
Важно слушать, а не только ждать своей очереди говорить.|It's important to listen rather than just wait for your turn to speak.
Мы можем не соглашаться друг с другом и всё равно уважать друг друга.|We can disagree and still respect each other.
Я хочу, чтобы наши решения были добровольными и взаимными.|I want our decisions to be voluntary and mutual.'''),
('B2','Объяснения и связи', '''Чем больше я практикуюсь, тем увереннее себя чувствую.|The more I practice, the more confident I feel.
Ничто из того, что мы обсудили, не меняет основной проблемы.|Nothing we've discussed changes the underlying issue.
Это именно тот навык, который мне нужно развить.|That's exactly the skill I need to develop.
Причина, по которой я задержался, была довольно простой.|The reason I was late was quite simple.
Несмотря на нехватку времени, мы завершили задачу.|Despite the lack of time, we completed the task.
Мне не удалось бы сделать это без предварительной подготовки.|I wouldn't have been able to do this without preparing in advance.
То, как ты это объяснил, помогло мне понять проблему.|The way you explained it helped me understand the problem.
Это решение оказалось эффективнее, чем мы предполагали.|The solution proved more effective than we'd anticipated.
Я не только исправил ошибку, но и понял её причину.|Not only did I fix the mistake, but I also understood its cause.
Как бы трудно это ни было, мы должны оставаться честными.|However difficult it may be, we need to remain honest.'''),
('B2','Свободное общение', '''Позволь мне переформулировать свою мысль.|Let me rephrase what I mean.
Если я правильно тебя понял, ты предлагаешь другой подход.|If I understand you correctly, you're suggesting a different approach.
Я понимаю, почему у тебя сложилось такое впечатление.|I can see why you got that impression.
Я бы не стал исключать такую возможность.|I wouldn't rule out that possibility.
Можешь чуть подробнее объяснить, что ты имеешь в виду?|Could you elaborate a little on what you mean?
Мне потребовалось время, чтобы осмыслить произошедшее.|It took me a while to process what had happened.
На первый взгляд это кажется простым, но есть нюансы.|It seems straightforward at first, but there are some nuances.
Дело не столько в деньгах, сколько в свободе выбора.|It's not so much about money as it is about freedom of choice.
Я стараюсь смотреть на ситуацию более объективно.|I'm trying to look at the situation more objectively.
Всё сводится к тому, что нам нужно больше практики.|It comes down to the fact that we need more practice.'''),
('B2','Мир и общество', '''Технологии постепенно меняют способы нашего общения.|Technology is gradually changing the way we communicate.
Доступ к образованию не должен зависеть от дохода.|Access to education shouldn't depend on income.
Автоматизация может создавать как возможности, так и проблемы.|Automation can create both opportunities and challenges.
Важно оценивать долгосрочные последствия решений.|It's important to assess the long-term consequences of decisions.
Каждый подход имеет свои ограничения.|Every approach has its limitations.
Мы должны учитывать разные культурные точки зрения.|We need to take different cultural perspectives into account.
Вопрос сложнее, чем кажется на первый взгляд.|The issue is more complex than it seems at first glance.
Эффективное сотрудничество требует взаимного уважения.|Effective collaboration requires mutual respect.
Изменения часто происходят постепенно, а не внезапно.|Change often happens gradually rather than suddenly.
Успех зависит не только от таланта, но и от постоянной практики.|Success depends not only on talent but also on consistent practice.'''),
]

results = []
for idx, (level, title, text) in enumerate(LESSONS):
    phrases = []
    for seq, line in enumerate(text.splitlines()):
        ru, en = line.strip().split('|')
        phrases.append({'id':f'u{idx+1:02d}p{seq+1:02d}', 'ru':ru,'en':en})
    results.append({'id':f'u{idx+1:02d}', 'level':level, 'title':title,'pairs':phrases})
out = Path(__file__).resolve().parents[1] / 'app/src/main/assets/curriculum.js'
out.write_text('window.WOLFIE_LESSONS = '+json.dumps(results, ensure_ascii=False, indent=2)+';\n',encoding='utf-8')
print(f'{len(results)} lessons, {sum(len(x["pairs"]) for x in results)} pairs')

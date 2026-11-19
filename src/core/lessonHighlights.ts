/**
 * Bản đồ đánh dấu / gạch chân trọng tâm ngữ pháp cho toàn bộ câu ví dụ
 * trong 16 bài học lý thuyết (`/learn/[tagCode]`).
 *
 * Mọi cụm từ trong mảng phải khớp chính xác chuỗi con trong câu tiếng Anh gốc
 * và được kiểm chứng tự động bởi `src/core/grammarLessons.test.ts`.
 */

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export const LESSON_EXAMPLE_HIGHLIGHTS: Record<string, string[]> = {
  // ================= 1. TENSES =================
  "Emma has lived in this coastal town for eight years.": [
    "has lived",
    "for eight years",
  ],
  "We booked our flight tickets to London two days ago.": [
    "booked",
    "two days ago",
  ],
  "The new community center will open to visitors tomorrow morning.": [
    "will open",
    "tomorrow morning",
  ],
  "The barista is currently preparing fresh beverages.": [
    "is currently preparing",
  ],
  "By next Friday, the repair crew will have finished the road renovations.": [
    "By next Friday",
    "will have finished",
  ],
  "By the time the guests arrived, we had set up the dinner table.": [
    "By the time",
    "arrived",
    "had set up",
  ],
  "Our support agents are used to handling urgent technical queries promptly.": [
    "are used to handling",
  ],
  "Water boils at 100 degrees Celsius and freezes at 0 degrees.": [
    "boils",
    "freezes",
  ],
  "Sarah jogs in the central park every morning before having breakfast.": [
    "jogs",
    "every morning",
  ],
  "The express train to Chicago departs at 8:30 AM tomorrow.": [
    "departs at 8:30 AM tomorrow",
  ],
  "The public library offers free Internet access to all registered members.": [
    "offers",
  ],
  "The barista is currently preparing fresh coffee for waiting customers.": [
    "is currently preparing",
  ],
  "We are having dinner with our college friends at an Italian restaurant tonight.":
    ["are having", "tonight"],
  "More and more consumers are buying groceries through smartphone apps these days.":
    ["are buying", "these days"],
  "Emma has lived in this beautiful coastal town for more than eight years.": [
    "has lived",
    "for more than eight years",
  ],
  "I have visited Japan twice, but I have never climbed Mount Fuji.": [
    "have visited",
    "twice",
    "have never climbed",
  ],
  "The delivery courier has just dropped off the package at the front desk.": [
    "has just dropped off",
  ],
  "Lucas has been practicing the guitar all afternoon for the upcoming school concert.":
    ["has been practicing", "all afternoon"],
  "Daniel finished his homework, packed his backpack, and walked to the bus stop.":
    ["finished", "packed", "walked"],
  "At 8:00 PM yesterday, our family was watching a comedy film together.": [
    "At 8:00 PM yesterday",
    "was watching",
  ],
  "While she was walking home from the supermarket, it suddenly started to rain.":
    ["While", "was walking", "started"],
  "By the time we arrived at the cinema, the movie had already started.": [
    "By the time",
    "arrived",
    "had already started",
  ],
  "Tom was completely exhausted when he got home because he had been working hard all day.":
    ["was", "had been working hard all day"],
  "We had been discussing the project budget for over an hour when the general manager finally arrived.":
    ["had been discussing", "for over an hour", "arrived"],
  "Don't worry about those heavy bags; I will carry them upstairs for you.": [
    "will carry",
  ],
  "The newly renovated sports center will open to the community next Monday.": [
    "will open",
    "next Monday",
  ],
  "We are going to visit our grandparents in the countryside this weekend.": [
    "are going to visit",
    "this weekend",
  ],
  "Look at those dark clouds in the sky; it is going to rain very soon.": [
    "dark clouds",
    "is going to rain",
  ],
  "At this time tomorrow, they will be relaxing on the sunny beach in Da Nang.": [
    "At this time tomorrow",
    "will be relaxing",
  ],
  "By the end of this semester, students will have completed all their course projects.":
    ["By the end of this semester", "will have completed"],
  "By the time your train arrives tomorrow morning, we will have prepared your guest room.":
    ["By the time", "arrives", "will have prepared"],
  "By the end of this year, Mr. Henderson will have been managing the regional sales team for a full decade.":
    ["By the end of this year", "will have been managing", "for a full decade"],
  "As soon as you confirm your reservation, we will send you the flight tickets.":
    ["As soon as", "confirm", "will send"],
  "By the time the music concert starts, the venue staff will have arranged all the seats.":
    ["By the time", "starts", "will have arranged"],
  "By the time the doctor arrived, the nurse had already checked the patient's temperature.":
    ["By the time", "arrived", "had already checked"],
  "David has played the acoustic guitar since he was in high school.": [
    "has played",
    "since",
    "was",
  ],
  "While Laura was reading a novel in the garden, her phone suddenly rang.": [
    "While",
    "was reading",
    "rang",
  ],
  "He used to commute by train, but now he is used to driving to the office every morning.":
    ["used to commute", "is used to driving"],
  "I am living with some colleagues until I find an apartment of my own.": [
    "am living",
  ],
  "My parents live in Da Nang and have been there their entire lives.": [
    "live in Da Nang",
  ],
  "The modern novelist has written over thirty bestselling business books.": [
    "has written",
  ],
  "William Shakespeare wrote more than thirty-seven world-famous plays.": [
    "wrote",
  ],
  "My hands are very greasy because I have been repairing my bicycle.": [
    "have been repairing",
  ],
  "My bicycle is running smoothly again because I have repaired it.": [
    "have repaired",
  ],
  "Mr. Henderson was reviewing the quarterly budget when the fire alarm suddenly sounded.":
    ["was reviewing", "when", "sounded"],
  "Mr. Henderson reviewed the budget, signed the contract, and left the office.":
    ["reviewed", "signed", "left"],
  "Before her promotion to director, she had completed three high-profile international projects.":
    ["had completed three high-profile international projects"],
  "Before her promotion to director, she had been working tirelessly for that branch for seven years.":
    ["had been working tirelessly", "for seven years"],
  "Gary has been trying to contact you. – Really? OK, I'll call him right now.":
    ["I'll call", "right now"],
  "Gary has been trying to contact you. – Yes, I know. I am going to call him this evening.":
    ["Yes, I know", "am going to call"],

  // ================= 2. WORD FORM =================
  "production, improvement, convenience, reliability, supervisor": [
    "tion",
    "ment",
    "ence",
    "ity",
    "or",
  ],
  "profitable, responsive, financial, continuous, successful": [
    "able",
    "ive",
    "ial",
    "ous",
    "ful",
  ],
  "efficient + ly = efficiently, prompt + ly = promptly": [
    "efficiently",
    "promptly",
  ],
  "The system is currently operating at full capacity.": [
    "is currently operating",
  ],
  "finalize, participate, strengthen, clarify": [
    "finalize",
    "participate",
    "strengthen",
    "clarify",
  ],
  "The recent expansion has created several job opportunities.": [
    "The recent expansion",
    "several job opportunities",
  ],
  "The supervisor commended her outstanding performance.": [
    "her outstanding performance",
  ],
  "Thank you for your warm hospitality during our visit.": [
    "for your warm hospitality",
    "during our visit",
  ],
  "We offer comprehensive training for new recruits.": [
    "comprehensive training",
    "new recruits",
  ],
  "The conference room remains available for today's seminar.": [
    "remains available",
  ],
  "Please keep all personal identification details confidential.": [
    "keep",
    "confidential",
  ],
  "The software has successfully completed the data migration.": [
    "has successfully completed",
  ],
  "The head chef has remarkably extensive culinary experience.": [
    "remarkably extensive",
  ],
  "Unfortunately, the flight was delayed due to heavy fog.": [
    "Unfortunately,",
  ],
  "The executive steering committee unanimously approved the proposed merger.": [
    "unanimously approved",
  ],
  "The project manager will notify all stakeholders once the inspection is completed.":
    ["will notify"],
  "We need to widen our distribution network to reach rural consumers.": [
    "to widen",
  ],
  "decide (v) -> decision (n) -> decisive (adj) -> decisively (adv)": [
    "decision (n)",
    "decisive (adj)",
    "decisively (adv)",
  ],
  "compete (v) -> competition/competitor (n) -> competitive (adj) -> competitively (adv)":
    ["competition/competitor (n)", "competitive (adj)", "competitively (adv)"],
  "rely (v) -> reliance (n) -> reliable (adj) -> reliably (adv)": [
    "reliance (n)",
    "reliable (adj)",
    "reliably (adv)",
  ],

  // ================= 3. SUBJECT-VERB AGREEMENT =================
  "Each of the participants receives a certificate.": ["Each", "receives"],
  "A number of clients have voiced their satisfaction.": [
    "A number of clients",
    "have voiced",
  ],
  "The number of online orders has doubled this quarter.": [
    "The number of online orders",
    "has doubled",
  ],
  "The manager, along with his assistants, is attending the summit.": [
    "The manager",
    "is attending",
  ],
  "The shipment of electronic components has arrived at the warehouse.": [
    "The shipment",
    "has arrived",
  ],
  "The supervisor who oversees the regional sales teams attends every quarterly review.":
    ["The supervisor", "attends"],
  "Each of the participants receives a certificate upon completion.": [
    "Each of the participants",
    "receives",
  ],
  "A number of international investors have visited the factory this week.": [
    "A number of",
    "have visited",
  ],
  "The number of registered attendees has reached 500.": [
    "The number of",
    "has reached",
  ],
  "Neither the director nor his assistants were aware of the regulation change.":
    ["Neither", "nor his assistants", "were"],
  "The CEO, along with several department heads, is attending the summit.": [
    "The CEO",
    "along with",
    "is attending",
  ],
  "The executive committee has decided to postpone the annual conference until October.":
    ["The executive committee", "has decided"],
  "There is an urgent need for additional skilled technicians on the assembly line.":
    ["There is", "an urgent need"],
  "There are several unresolved technical discrepancies in the quarterly financial audit.":
    ["There are", "several unresolved technical discrepancies"],

  // ================= 4. PASSIVE VOICE =================
  "The new guidelines were approved by the steering committee.": [
    "were approved by",
  ],
  "The committee approved the new guidelines yesterday.": [
    "approved the new guidelines",
  ],
  "All visitors are required to wear identification badges.": [
    "are required to wear",
  ],
  "The keynote speaker is expected to arrive at 10 AM.": [
    "is expected to arrive",
  ],
  "All invoices are processed electronically by the finance division.": [
    "are processed",
    "by the finance division",
  ],
  "The confidential contract was signed by both parties yesterday.": [
    "was signed",
    "by both parties",
  ],
  "The hotel policy has been revised to provide complimentary breakfast for all guests.":
    ["has been revised"],
  "The auditorium is being prepared for the evening music concert.": [
    "is being prepared",
  ],
  "Safety helmets must be worn at all times inside the construction site.": [
    "must be worn",
  ],
  "All team leaders were granted administrative access to the client database.": [
    "were granted administrative access",
  ],
  "The manager had the promotional brochures reprinted before the convention.": [
    "had the promotional brochures reprinted",
  ],
  "It is widely anticipated that the central bank will lower interest rates next month.":
    ["It is widely anticipated that"],
  "It has been reported that company revenue grew by 15% year-over-year.": [
    "It has been reported that",
  ],
  "Dr. Aris Thorne is scheduled to deliver the keynote address at the technology symposium.":
    ["is scheduled to deliver"],
  "All overseas delegates are expected to arrive at the venue before 9:00 AM.": [
    "are expected to arrive",
  ],

  // ================= 5. CONJUNCTIONS & PREPOSITIONS =================
  "The flight was delayed because severe weather affected the region.": [
    "because severe weather affected",
  ],
  "The flight was delayed due to severe weather conditions.": [
    "due to severe weather conditions",
  ],
  "Although the budget was limited, the campaign succeeded.": [
    "Although the budget was limited",
  ],
  "Despite the limited budget, the campaign succeeded.": [
    "Despite the limited budget",
  ],
  "Submit by Friday (hoàn tất) vs Open until Friday (liên tục)": [
    "by Friday",
    "until Friday",
  ],
  "Although the budget was severely constrained, the campaign succeeded.": [
    "Although",
    "was severely constrained",
  ],
  "Despite severe budget constraints, the marketing campaign succeeded.": [
    "Despite",
    "severe budget constraints",
  ],
  "The flight was delayed because severe storms struck the coast.": [
    "because",
    "struck",
  ],
  "Please keep your mobile phones silenced during the presentation.": [
    "during the presentation",
  ],
  "While the speaker was presenting, audience members took detailed notes.": [
    "While",
    "was presenting",
  ],
  "All grant proposals must be submitted by Friday at 5:00 PM.": [
    "by Friday at 5:00 PM",
  ],
  "The technical support hotline will remain operational until midnight.": [
    "until midnight",
  ],
  "Dr. Kelly will be out of the office for two consecutive weeks.": [
    "for two consecutive weeks",
  ],
  "Several important policy amendments were discussed during the annual summit.":
    ["during the annual summit"],
  "Unless we receive formal authorization by noon, the product shipment will be withheld.":
    ["Unless"],
  "Employees may work remotely on Fridays provided that all deadlines have been met.":
    ["provided that"],
  "Please keep a printed copy of your boarding pass in case the airport app experiences glitches.":
    ["in case"],

  // ================= 6. GERUND & INFINITIVE =================
  "We look forward to receiving your constructive feedback.": [
    "look forward to receiving",
  ],
  "In an effort to reduce overhead costs, energy usage was trimmed.": [
    "In an effort to reduce",
  ],
  "Upon entering the building, guests must sign in.": ["Upon entering"],
  "The student club decided to organize a charity book drive this weekend.": [
    "decided to organize",
  ],
  "The airline offers to compensate passengers affected by flight delays.": [
    "offers to compensate",
  ],
  "My family is currently considering traveling to Da Nang for our summer vacation.":
    ["considering traveling"],
  "We sincerely appreciate your completing the customer feedback questionnaire.": [
    "appreciate your completing",
  ],
  "We look forward to welcoming you to our coastal resort next weekend.": [
    "look forward to welcoming",
  ],
  "Our organization is firmly committed to reducing plastic waste in the community.":
    ["committed to reducing"],
  "Please remember to submit your receipts to the accounting department before the 25th.":
    ["remember to submit"],
  "The CEO distinctly remembers signing the initial partnership agreement in Tokyo.":
    ["remembers signing"],
  "We regret to inform you that your application was not selected for the final round.":
    ["regret to inform"],
  "He now regrets investing in that volatile venture without conducting due diligence.":
    ["regrets investing"],
  "The inspection team stopped to examine the emergency exit on the fourth floor.":
    ["stopped to examine"],
  "The plant permanently stopped using ozone-depleting refrigerants last year.": [
    "stopped using",
  ],
  "Engineers tried to restore the mainframe server within two hours.": [
    "tried to restore",
  ],
  "If the application freezes, try clearing your browser cache.": [
    "try clearing",
  ],
  "There is no point in disputing the vendor invoice without valid supporting documentation.":
    ["no point in disputing"],
  "The revised marketing proposal is certainly worth considering at the upcoming board meeting.":
    ["worth considering"],
  "Several overseas clients had difficulty accessing the newly launched customer portal.":
    ["had difficulty accessing"],

  // ================= 7. PARTICIPLES =================
  "an increasing number of consumers / leading provider": [
    "increasing",
    "leading",
  ],
  "The items ordered online will be delivered tomorrow.": ["ordered online"],
  "The survey reported an increasing demand for organic food options.": [
    "increasing demand",
  ],
  "Bright Vision is a leading provider of digital photography services.": [
    "leading provider",
  ],
  "Please review the attached document before tomorrow's conference call.": [
    "attached document",
  ],
  "We need to hire an experienced project manager for the infrastructure project.":
    ["experienced project manager"],
  "Anyone requesting special travel accommodations should notify HR immediately.":
    ["requesting special travel accommodations"],
  "The revised budget approved by the board will take effect next quarter.": [
    "approved by the board",
  ],
  "Having finalized the comprehensive market audit, the consultants presented their recommendations.":
    ["Having finalized"],

  // ================= 8. RELATIVE CLAUSES =================
  "We interviewed candidates whose qualifications matched our needs.": [
    "candidates whose qualifications",
  ],
  "The committee with which we collaborated was highly supportive.": [
    "with which",
  ],
  "Mr. Patel, who joined last month, has made an immediate impact.": [
    ", who joined last month,",
  ],
  "The engineer who designed the automated sorting system received an award.": [
    "engineer who designed",
  ],
  "The candidate whom we interviewed this morning has exceptional qualifications.":
    ["candidate whom we interviewed"],
  "We signed a contract with a vendor whose prices were highly competitive.": [
    "vendor whose prices",
  ],
  "The project in which we invested yielded substantial returns.": ["in which"],
  "Mr. Kenneth Tanaka, who recently joined our advisory board, will preside over the ceremony.":
    ["Mr. Kenneth Tanaka, who"],
  "The technology symposium to which we submitted our paper takes place in Geneva.":
    ["to which"],
  "The candidate with whom the panel conducted the final interview has been offered the role.":
    ["with whom"],

  // ================= 9. CONDITIONALS & SUBJUNCTIVE =================
  "Should you need further assistance, please do not hesitate to call.": [
    "Should you need",
  ],
  "You may take leave provided that your manager approves.": ["provided that"],
  "Should you have any inquiries regarding your booking, please contact customer support.":
    ["Should you have"],
  "Had the supplier delivered the components on schedule, we would have met our deadline.":
    ["Had the supplier delivered", "would have met"],
  "The doctor strongly recommended that the patient take adequate rest and drink plenty of fluids.":
    ["recommended that", "take", "drink"],
  "If the client approves the revised proposal, we will commence production immediately.":
    ["approves", "will commence"],
  "If we had additional warehouse space, we could store more bulk inventory.": [
    "had",
    "could store",
  ],
  "If the logistics firm had monitored the weather alert, the shipment would not have been delayed.":
    ["had monitored", "would not have been delayed"],
  "The regional manager wishes that our supply chain were more resilient to disruptions.":
    ["wishes that", "were"],

  // ================= 10. COMPARISONS =================
  "The revised plan is significantly more cost-effective.": [
    "significantly more cost-effective",
  ],
  "Please reply as promptly as possible.": ["as promptly as"],
  "The upgraded server system is significantly faster than the old setup.": [
    "significantly faster than",
  ],
  "Please return the signed agreement as promptly as possible.": [
    "as promptly as",
  ],
  "The more thoroughly you analyze the market data, the better your strategic decisions will be.":
    ["The more thoroughly", "the better"],
  "The revised user interface is simpler and more intuitive than the legacy system.":
    ["simpler and more intuitive than"],
  "For further information regarding corporate subscriptions, please contact sales.":
    ["further information"],
  "Online sales volume this holiday season was twice as high as that of last year.":
    ["twice as high as"],

  // ================= 11. NOUNS & PRONOUNS =================
  "The software engineer resolved the server error by himself.": ["by himself"],
  "All participants received their registration packets.": [
    "their registration packets",
  ],
  "Our sales figures exceeded their expectations.": [
    "Our sales figures",
    "their expectations",
  ],
  "Your presentation was informative, and ours was equally well received.": [
    "Your presentation",
    "ours",
  ],
  "The software engineer resolved the complex network glitch by himself.": [
    "by himself",
  ],
  "Passengers were advised to keep their luggage within the weight limit.": [
    "luggage",
  ],
  "The visitor asked the front desk for detailed tourist information about the city.":
    ["information"],
  "The committee spent a great deal of time analyzing the audit discrepancies.": [
    "a great deal of time",
  ],
  "Several qualified candidates applied for the senior financial analyst position.":
    ["Several qualified candidates"],
  "We had a little time before the flight, so we reviewed the contract draft.": [
    "a little time",
  ],
  "Unfortunately, few participants attended the optional safety briefing.": [
    "few participants",
  ],

  // ================= 12. ADJECTIVES & ADVERBS =================
  "Please keep the storage facility secure at all times.": [
    "keep",
    "secure",
  ],
  "Fuel prices remain volatile due to global shortages.": ["remain volatile"],
  "The automated security system keeps customer credentials completely secure.":
    ["keeps", "completely secure"],
  "The employees were satisfied with the annual bonus package.": [
    "were satisfied",
  ],
  "The financial forecast showed satisfying growth figures.": [
    "satisfying growth figures",
  ],
  "The development team worked extraordinarily hard to meet the quarterly milestone.":
    ["worked extraordinarily hard"],
  "The projector bulb was so dim that attendees could hardly read the slides.": [
    "hardly read",
  ],
  "Due to flight delays, the guest speaker arrived late to the conference.": [
    "arrived late",
  ],
  "Have you noticed any noticeable shifts in customer demand lately?": [
    "lately",
  ],
  "Nearly 300 prospective buyers registered for the property preview exhibition.":
    ["Nearly 300"],
  "The revised compliance handbook is highly recommended for intermediate learners.":
    ["highly recommended"],
  "Our quality control team regularly inspects finished goods before shipment.": [
    "regularly inspects",
  ],
  "The internal server is currently undergoing scheduled system maintenance.": [
    "is currently undergoing",
  ],

  // ================= 13. MODALS =================
  "All visitors must register at the reception desk.": ["must register"],
  "The doctor recommended that the patient get plenty of rest.": [
    "recommended that",
    "get",
  ],
  "The technician should have checked the wiring before activating the machine.":
    ["should have checked"],
  "Mr. Lee must have missed the announcement because he was not in the auditorium.":
    ["must have missed"],
  "All visitors must display their security passes prominently while on the corporate premises.":
    ["must display"],
  "Due to the power outage, employees have to complete their paper documentation manually.":
    ["have to complete"],
  "Unauthorized personnel must not enter the high-voltage electrical facility.": [
    "must not enter",
  ],
  "Staff members do not have to attend the orientation session if they have already completed it online.":
    ["do not have to attend"],
  "He has been in conference meetings non-stop for eight hours; he must be exhausted.":
    ["must be"],
  "The quarterly revenue figures can't be negative; all our product lines recorded record sales.":
    ["can't be"],
  "Inclement weather conditions might cause minor delays in flight departures.": [
    "might cause",
  ],

  // ================= 14. INVERSION =================
  "Rarely has the firm achieved such rapid revenue growth.": [
    "Rarely has the firm achieved",
  ],
  "Under no circumstances should confidential files be shared.": [
    "Under no circumstances should confidential files be shared",
  ],
  "Rarely has a young athlete achieved such outstanding success so quickly.": [
    "Rarely has a young athlete achieved",
  ],
  "Under no circumstances should confidential patient records be disclosed to third parties.":
    ["Under no circumstances should confidential patient records be disclosed"],
  "Only after conducting thorough safety trials did the pharmaceutical firm launch the drug.":
    ["Only after", "did the pharmaceutical firm launch"],
  "Only by implementing automated manufacturing can we meet the surged demand.":
    ["Only by", "can we meet"],
  "The regional branch reached its quarterly sales targets, and so did the overseas office.":
    ["so did the overseas office"],
  "The CEO was not briefed on the incident, and neither were the division directors.":
    ["neither were the division directors"],

  // ================= 15. COLLOCATIONS & PHRASAL VERBS =================
  "The team worked overtime to meet the tight deadline.": [
    "meet the tight deadline",
  ],
  "Management decided to conduct an employee survey.": [
    "conduct an employee survey",
  ],
  "The new branch is conveniently located near the subway.": [
    "conveniently located",
  ],
  "The factory operates in compliance with safety standards.": [
    "in compliance with",
  ],
  "The development team worked overtime to meet the tight deadline.": [
    "meet the tight deadline",
  ],
  "We will conduct a comprehensive survey to gather user feedback.": [
    "conduct a comprehensive survey",
  ],
  "The newly opened conference hotel is conveniently located near the subway station.":
    ["conveniently located"],
  "The plant operates in strict compliance with federal environmental regulations.":
    ["in strict compliance with"],
  "Management decided to call off the quarterly shareholder reception due to severe weather.":
    ["call off"],
  "The technical crew will carry out routine network maintenance over the weekend.":
    ["carry out"],
  "The candidate turned down the initial employment offer in hopes of negotiating better benefits.":
    ["turned down"],

  // ================= 16. PARALLEL STRUCTURE =================
  "The duties include drafting reports, filing invoices, and answering inquiries.":
    ["drafting reports", "filing invoices", "answering inquiries"],
  "The software is both reliable and user-friendly.": [
    "both reliable and user-friendly",
  ],
  "The candidate's presentation was clear, concise, and persuasive.": [
    "clear, concise, and persuasive",
  ],
  "Her responsibilities include drafting contracts, negotiating terms, and managing client accounts.":
    ["drafting contracts", "negotiating terms", "managing client accounts"],
  "The initiative aimed both to expand market share and to enhance brand loyalty.":
    ["both to expand", "and to enhance"],
  "Many modern professionals prefer working remotely to commuting long distances daily.":
    ["prefer working", "to commuting"],
  "The board would rather invest in automated tools than hire temporary personnel.":
    ["would rather invest", "than hire"],

  // ================= EXTRA EXAMPLES (GROUNDED FROM NOTEBOOKLM) =================
  "The cancellation clause appears at the back of the contract.": [
    "The cancellation clause",
    "the contract",
  ],
  "Each employee must conduct a careful inspection.": [
    "Each employee",
    "a careful inspection",
  ],
  "Her self-assurance showed clearly why she led the negotiations.": [
    "Her self-assurance",
    "the negotiations",
  ],
  "The customer's specific complaint was not addressed in his e-mail.": [
    "customer's specific complaint",
    "his e-mail",
  ],
  "The two parties agreed to a settlement in their contract dispute.": [
    "to a settlement",
    "in their contract dispute",
  ],
  "Before engaging in a new business, it is important to do thorough research.": [
    "Before engaging",
  ],
  "The merger of the two companies established a powerful new corporation.": [
    "powerful new corporation",
  ],
  "In a contract, one specific word can change the meaning dramatically.": [
    "specific word",
  ],
  "The parties are agreeable to the terms of the revised contract.": [
    "are agreeable",
  ],
  "Garments become wrinkled after they have been tried on several times at the store.": [
    "become wrinkled",
  ],
  "Some people find it difficult to concentrate when there is loud noise nearby.": [
    "find it difficult",
  ],
  "A quality raincoat can repel rain and keep you dry.": ["keep you dry"],
  "The numbers in the computer log should accurately reflect the actual stock on the shelf.": [
    "should accurately reflect",
  ],
  "Warranties for this kind of appliance are frequently limited in their coverage.": [
    "are frequently limited",
  ],
  "The conference center manager was extremely accommodating during our stay.": [
    "extremely accommodating",
  ],
  "He negotiates so skillfully that both parties feel satisfied with the outcome.": [
    "so skillfully",
  ],
  "Technically, the contractor was dismissed from the project due to missed deadlines.": [
    "Technically,",
  ],
  "Sam drove carefully along the narrow road after the evening storm.": [
    "carefully",
  ],
  "The mediator resolved the problem to everyone's satisfaction.": [
    "resolved",
  ],
  "The auditor carefully scrutinized the quarterly financial records.": [
    "carefully scrutinized",
  ],
  "The shipment from the supplier was short a number of items, so we complained.": [
    "The shipment",
    "was",
  ],
  "A compilation of factors led us to inspect the missing warehouse inventory.": [
    "A compilation",
    "led",
  ],
  "The building that was destroyed in the fire has now been rebuilt.": [
    "The building",
    "has now been rebuilt",
  ],
  "The brochure containing the information I needed was very helpful.": [
    "The brochure",
    "was",
  ],
  "Every seat in the theatre was taken before the keynote speech began.": [
    "Every seat",
    "was",
  ],
  "Neither of the restaurants we went to was expensive.": [
    "Neither of",
    "was",
  ],
  "Neither Joe nor Sam has a car to commute to the regional office.": [
    "Neither",
    "nor Sam",
    "has",
  ],
  "Not only the project manager but also the junior engineers are attending the workshop.": [
    "Not only",
    "but also the junior engineers",
    "are attending",
  ],
  "The executive director, as well as the department supervisors, is attending the trade conference.": [
    "The executive director",
    "is attending",
  ],
  "The revised contract, together with all associated invoices, was delivered yesterday.": [
    "The revised contract",
    "was delivered",
  ],
  "The planning committee was very selective about who received invitations.": [
    "The planning committee",
    "was",
  ],
  "The hotel staff was able to accommodate our many needs for the conference.": [
    "The hotel staff",
    "was",
  ],
  "The situation is serious. Something must be done before it is too late.": [
    "must be done",
  ],
  "The assumed results should be kept confidential until the product is retested.": [
    "should be kept",
  ],
  "I have been offered the job, but I am still reviewing the relocation package.": [
    "have been offered",
  ],
  "I didn't see the original document, but I was shown a certified copy.": [
    "was shown a certified copy",
  ],
  "Lisa had the roof repaired yesterday before the heavy rain season began.": [
    "had the roof repaired",
  ],
  "You need to get this document translated into English as soon as possible.": [
    "get this document translated",
  ],
  "You cannot enter the restricted lab unless you are an authorized member.": [
    "unless",
  ],
  "The company will have to close its branch unless business improves soon.": [
    "unless",
  ],
  "Travelling by car is convenient provided that you have somewhere to park.": [
    "provided that",
  ],
  "You can borrow the company vehicle as long as you promise to return it by 6 PM.": [
    "as long as",
  ],
  "Your delivery van should carry a spare wheel in case you have a puncture.": [
    "in case",
  ],
  "I will write down my security password in case I forget it next week.": [
    "in case",
  ],
  "I had no trouble finding a reliable supplier for our packaging materials.": [
    "had no trouble finding",
  ],
  "The technician spent two hours trying to repair the main office printer.": [
    "spent two hours trying",
  ],
  "Having finished her quarterly audit report, the accountant went home.": [
    "Having finished",
  ],
  "Having seen the training presentation twice, the team mastered the workflow.": [
    "Having seen",
  ],
  "We helped a woman whose company car had broken down near the highway.": [
    "woman whose company car",
  ],
  "The firm prefers recruiting candidates whose leadership background fits our culture.": [
    "candidates whose leadership background",
  ],
  "The telecommunications firm for which she works operates across Asia.": [
    "for which",
  ],
  "The new headquarters, which cost millions of dollars, will open next week.": [
    ", which",
  ],
  "John, who speaks French fluently, applied for the overseas position.": [
    "John, who",
  ],
  "The annual report, which was published yesterday, outlines our five-year goals.": [
    "annual report, which",
  ],
  "Should the situation change, our customer team will let you know immediately.": [
    "Should the situation change",
  ],
  "Should there be any technical problems, please call the IT helpdesk right away.": [
    "Should there be",
  ],
  "Had we known about the flight delay, we would not have arrived so early.": [
    "Had we known",
    "would not have arrived",
  ],
  "Had the committee approved the funds earlier, the renovation would have started in June.": [
    "Had the committee approved",
    "would have started",
  ],
  "The committee suggested that something be done about the parking shortage.": [
    "suggested that",
    "be done",
  ],
  "It is essential that everyone be here on time for the safety briefing.": [
    "essential that",
    "be",
  ],
  "If it does not rain tomorrow morning, we will organize the outdoor event.": [
    "does not rain",
    "will organize",
  ],
  "If I were responsible for purchasing, I would negotiate a lower unit price.": [
    "were",
    "would negotiate",
  ],
  "If I had known our partner was visiting, I would have booked a larger suite.": [
    "had known",
    "would have booked",
  ],
  "I wish I had a detailed schedule before entering the afternoon meeting.": [
    "wish I had",
  ],
  "We wish we had checked the invoice total before transferring the deposit.": [
    "wish we had checked",
  ],
  "Our updated packaging is significantly less expensive than the previous design.": [
    "significantly less expensive than",
  ],
  "Her new managerial job is much more demanding than the previous one.": [
    "much more demanding than",
  ],
  "Can you send me the verified shipping figures as soon as possible, please?": [
    "as soon as",
  ],
  "The more our sales representatives practiced, the more confident they became.": [
    "The more",
    "the more confident",
  ],
  "Petrol is twice as expensive as it was a few years ago.": [
    "twice as expensive as",
  ],
  "Their new logistics hub is about three times as big as our old warehouse.": [
    "three times as big as",
  ],
  "Dr. Wan established herself as an authority on conflict resolution.": [
    "herself",
  ],
  "I am not going to do that audit report for you; you can complete it yourself.": [
    "yourself",
  ],
  "It is refreshing to see a manager with so much confidence in her employees.": [
    "much confidence",
  ],
  "Anna is very busy these days and has very little free time.": [
    "little free time",
  ],
  "The warehouse manager ordered several new scanners for the shipping team.": [
    "several new scanners",
  ],
  "How many corporate clients attended the annual technology exhibition?": [
    "many corporate clients",
  ],
  "Many analysts find it difficult to forecast seasonal demand accurately.": [
    "find it difficult",
  ],
  "Anna lives quite near our office, so she rarely misses early briefings.": [
    "near our office",
  ],
  "We had spent nearly all our quarterly budget before the trade fair opened.": [
    "nearly all",
  ],
  "The company's recruitment resulted in ten highly qualified new employees.": [
    "highly qualified",
  ],
  "The wall around the loading bay was too high to climb over.": [
    "too high",
  ],
  "Take an umbrella with you because it might rain later this afternoon.": [
    "might rain",
  ],
  "There may not be enough time to discuss every proposal at today's meeting.": [
    "may not be",
  ],
  "Rarely has an applicant demonstrated such exceptional qualifications.": [
    "Rarely has an applicant demonstrated",
  ],
  "Never have we seen such strong demand for a newly released product.": [
    "Never have we seen",
  ],
  "Under no circumstances will refunds be issued without the original receipt.": [
    "Under no circumstances will refunds be issued",
  ],
  "Extra supplies of the printer toner are readily available upon request.": [
    "readily available",
  ],
  "The company is constantly recruiting highly qualified software engineers.": [
    "highly qualified",
  ],
  "The vice president signed the merger documents on behalf of the board of directors.": [
    "on behalf of",
  ],
  "The work was completed strictly in accordance with our technical specifications.": [
    "in accordance with",
  ],
  "The facility provides training for both new recruits and experienced supervisors.": [
    "both new recruits and experienced supervisors",
  ],
  "The seminar was not only informative but also inspiring for the entire sales team.": [
    "not only informative",
    "but also inspiring",
  ],
  "You are out of breath. Have you been running up the stairs?": [
    "Have you been running",
  ],
  "The man sitting next to me on the plane was nervous because he had never flown before.": [
    "had never flown before",
  ],
  "Our warehouse team will be running the inventory check next weekend, so finalize orders early.": [
    "will be running",
  ],
  "By next month, our support team will have been operating this data center for ten years.": [
    "By next month",
    "will have been operating",
    "for ten years",
  ],
  "I will send you an update as soon as I receive the signed inspection report.": [
    "will send",
    "as soon as",
    "receive",
  ],
  "The warranty no longer covers your product once it expires.": [
    "once",
    "expires",
  ],
  "By the time we get to the conference hall, the keynote speech will already have started.": [
    "By the time",
    "get",
    "will already have started",
  ],
  "By the time the delivery truck arrived at the warehouse, the staff had already left.": [
    "By the time",
    "arrived",
    "had already left",
  ],
  "Ms. Henderson has worked as accounting head since the firm opened five years ago.": [
    "has worked",
    "since",
    "opened",
  ],
  "The office manager received an urgent message while she was reviewing the monthly budget.": [
    "received",
    "while",
    "was reviewing",
  ],
  "Lisa has lived in London for three years, so she is used to driving on the left.": [
    "is used to driving",
  ],
  "Before electronic spreadsheets were adopted, clerks used to calculate totals by hand.": [
    "used to calculate",
  ],
};

/**
 * Lấy danh sách cụm từ đánh dấu cho một câu ví dụ.
 * Ưu tiên highlight khai báo tường minh nếu có.
 */
export function getExampleHighlights(
  sentenceEn: string,
  explicitHighlight?: string | string[]
): string[] {
  if (explicitHighlight) {
    return Array.isArray(explicitHighlight)
      ? explicitHighlight.filter(Boolean)
      : [explicitHighlight];
  }
  return LESSON_EXAMPLE_HIGHLIGHTS[sentenceEn] ?? [];
}

/**
 * Tách câu văn bản thành các đoạn thường và đoạn được gạch chân / tô sáng
 * không chồng lấn, ưu tiên khớp cụm dài trước và khớp theo vị trí đầu tiên hợp lệ.
 */
export function splitTextWithHighlights(
  text: string,
  highlights: string[]
): HighlightSegment[] {
  if (!text || highlights.length === 0) {
    return text ? [{ text, highlighted: false }] : [];
  }

  // Sắp xếp cụm dài hơn trước để tránh cụm ngắn cắt ngang cụm dài
  const sortedPhrases = Array.from(
    new Set(highlights.map((h) => h.trim()).filter(Boolean))
  ).sort((a, b) => b.length - a.length);

  interface Span {
    start: number;
    end: number;
  }

  const spans: Span[] = [];

  for (const phrase of sortedPhrases) {
    let searchFrom = 0;
    while (searchFrom < text.length) {
      const idx = text.indexOf(phrase, searchFrom);
      if (idx === -1) break;
      const end = idx + phrase.length;

      const overlaps = spans.some(
        (existing) => idx < existing.end && end > existing.start
      );
      if (!overlaps) {
        spans.push({ start: idx, end });
        break; // Mỗi cụm mục tiêu đánh dấu một lần tiêu biểu nhất trong ví dụ
      }
      searchFrom = idx + 1;
    }
  }

  if (spans.length === 0) {
    return [{ text, highlighted: false }];
  }

  spans.sort((a, b) => a.start - b.start);

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const span of spans) {
    if (span.start > cursor) {
      segments.push({
        text: text.slice(cursor, span.start),
        highlighted: false,
      });
    }
    segments.push({
      text: text.slice(span.start, span.end),
      highlighted: true,
    });
    cursor = span.end;
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      highlighted: false,
    });
  }

  return segments;
}

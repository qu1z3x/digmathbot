import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import fs from "fs";

import {
	sendDataAboutText,
	sendDataAboutButton,
	sendDataAboutError,
} from "./tgterminal.js";

import { config } from "./config.js";

const TOKEN = config.TOKENs[0]; // 1 - оригинал
const bot = new TelegramBot(TOKEN, { polling: true });

const qu1z3xId = "923690530";
const jackId = "6815420098";
let BotName = "digmathbot";

let usersData = [];

const topics = [
	{ symbol: "+", name: "Сложение" }, // 1	"+",
	{ symbol: "-", name: "Вычитание" }, // 2	"-",
	{ symbol: "×", name: "Умножение" }, // 3	"×",
	{ symbol: "/", name: "Деление" }, // 4	"/",
	{ symbol: "²", name: "Квадрат (x²)" }, // 5	"²",
	{ symbol: "²√", name: "Кв. корни" }, // 6	"²√",
	{ symbol: "³", name: "Куб (x³)" }, // 7	"³",
	{ symbol: "³√", name: "Куб. корни" }, // 8	"³√",
	{ symbol: "!", name: "Факториалы" }, // 9	"!",
	// {symbol: "log", name: "Логарифмы"},// 10  "log",
	// {symbol: "cos", name: "Основы тригонометрии"},// 11  "cos"
];

const motivationPhrases = [
	"Сохраняй дух! 🔥",
	"Прекрасно! 👍",
	"Отлично! 👏",
	"Просто супер! ✨",
	"Блестяще! 🔥",
	"Ты молодца! 🙌",
	"Замечательно! 💫",
	"Так держать! 🚀",
	"Ты чувствуешь! 😄",
	"Хорошо справляешься! 💪",
	"Хорошо идешь! 🚀",
	"Не останавливайся! 💪",
];

bot.setMyCommands([
	{
		command: "/restart",
		description: "Перезапуск 🧮",
	},
]);

let rndNum, textToSayHello, match, rndId;

async function firstMeeting(chatId, numOfStage = 1) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = `firstMeeting${numOfStage}`;

		switch (numOfStage) {
			case 1:
				const dateNowHHNN =
					new Date().getHours() * 100 + new Date().getMinutes();

				if (dateNowHHNN < 1200 && dateNowHHNN >= 600)
					textToSayHello = "Доброго утра";
				else if (dateNowHHNN < 1700 && dateNowHHNN >= 1200)
					textToSayHello = "Доброго дня";
				else if (dateNowHHNN < 2200 && dateNowHHNN >= 1700)
					textToSayHello = "Доброго вечера";
				else if (dateNowHHNN >= 2200 || dateNowHHNN < 600)
					textToSayHello = "Доброй ночи";

				await bot.editMessageText(
					`${textToSayHello}! Я <b>Алгебравичок! 👋\n\nМоя цель</b> - помогать тебе поддерживать свой <b>математический тонус,</b> генерируя и создавая для тебя различные <b>математические функции</b> и <b>примеры</b> разных сложностей. 😊`,
					{
						parse_mode: "html",
						chat_id: chatId,
						message_id: usersData.find(
							(obj) => obj.chatId == chatId
						).messageId,
						disable_web_page_preview: true,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "Поехали считать! 🚀",
										callback_data: "firstMeeting2",
									},
								],
							],
						},
					}
				);
				break;
			case 2:
				await bot.editMessageText(
					`<b>Отлично!</b> Я чувствую <b>твой настрой!</b> 😃\n\nНо, для начала <b>познакомимся ближе,</b> напиши ниже <b>свое имя</b> ✍️`,
					{
						parse_mode: "html",
						chat_id: chatId,
						message_id: usersData.find(
							(obj) => obj.chatId == chatId
						).messageId,
						disable_web_page_preview: true,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: `Или оставить ${dataAboutUser.login} ✅`,
										callback_data: "firstMeeting3",
									},
								],
								[
									{
										text: `⬅️Назад`,
										callback_data: "firstMeeting1",
									},
								],
							],
						},
					}
				);
				break;
			case 3:
				firstMeeting(chatId, 4);

				// await bot.editMessageText(
				// 	`\n\n<i>Требуестя для идентификации и парных дуэлей в режиме "Аркада" 🔒</i>\n\n<b>Оставь свой номер телефона, используя автозаполнение! 😉</b>`,
				// 	{
				// 		parse_mode: "html",
				// 		chat_id: chatId,
				// 		message_id: usersData.find((obj) => obj.chatId == chatId)
				// 			.messageId,
				// 		disable_web_page_preview: true,
				// 	}
				// );

				// await bot
				// 	.sendMessage(
				// 		chatId,
				// 		`Нажми на кнопку <b>"Автозаполнить номер" ⬇️</b>`,
				// 		{
				// 			parse_mode: "HTML",
				// 			disable_web_page_preview: true,
				// 			reply_markup: {
				// 				keyboard: [
				// 					[
				// 						{
				// 							text: "Автозаполнить номер",
				// 							request_contact: true,
				// 						},
				// 					],
				// 				],
				// 			},
				// 		}
				// 	)
				// 	.then((message) => {
				// 		dataAboutUser.messageIdOther = message.message_id;
				// 	});
				break;
			case 4:
				let yourTopicsListText = "";
				for (let i = 0; i < topics.length; i++)
					if (dataAboutUser.matchesData.topicsStatus[i].active)
						yourTopicsListText += `\n- ${topics[i].name}`;

				await bot.editMessageText(
					`<b>${
						dataAboutUser.login
					}, очень приятно! 🤗</b>\n\n<b>Давай определимся с твоим уровнем!</b>${
						dataAboutUser.schoolClassNum &&
						!dataAboutUser.matchesData.topicsStatus.every(
							(obj) => !obj.active
						)
							? `\n<blockquote><b>Темы ${
									dataAboutUser.schoolClassNum == 12
										? `выбранные тобой:`
										: `${dataAboutUser.schoolClassNum}-го класса:`
							  }</b><i>${yourTopicsListText}</i></blockquote>`
							: `\n`
					}\n<i>(Изменяется в настроках)</i>\n\n<b>Выбери свой класс в школе:</b>`,
					{
						parse_mode: "html",
						chat_id: chatId,
						message_id: usersData.find(
							(obj) => obj.chatId == chatId
						).messageId,
						disable_web_page_preview: true,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text:
											dataAboutUser.schoolClassNum == 12
												? `• ⚙️ •`
												: ``,
										callback_data:
											dataAboutUser.schoolClassNum == 12
												? `-`
												: `-`,
									},
									{
										text:
											dataAboutUser.schoolClassNum == 8
												? `• 8-й •`
												: `8-й`,
										callback_data:
											dataAboutUser.schoolClassNum == 8
												? `-`
												: "setSchoolClassNum8InFirstMeeting4",
									},
									{
										text:
											dataAboutUser.schoolClassNum == 9
												? `• 9-й •`
												: `9-й`,
										callback_data:
											dataAboutUser.schoolClassNum == 9
												? `-`
												: "setSchoolClassNum9InFirstMeeting4",
									},
									{
										text:
											dataAboutUser.schoolClassNum == 10
												? `• 10-й •`
												: `10-й`,
										callback_data:
											dataAboutUser.schoolClassNum == 10
												? `-`
												: "setSchoolClassNum10InFirstMeeting4",
									},
									// {
									// 	text:
									// 		dataAboutUser.schoolClassNum == 11
									// 			? `• 11-й •`
									// 			: `11-й`,
									// 	callback_data:
									// 		dataAboutUser.schoolClassNum == 11
									// 			? `-`
									// 			: "setSchoolClassNum11InFirstMeeting4",
									// },
								],
								[
									{
										text: `Или выбрать свои темы ✏️`,
										callback_data: "topicsList",
									},
								],
								[
									{
										text: `⬅️Назад`,
										callback_data: "firstMeeting2",
									},
									{
										text:
											dataAboutUser.schoolClassNum &&
											!dataAboutUser.matchesData.topicsStatus.every(
												(obj) => !obj.active
											)
												? "Применить✅"
												: "",
										callback_data: "exit",
									},
								],
							],
						},
					}
				);
				break;
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function menuHome(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	const dateNowHHNN = new Date().getHours() * 100 + new Date().getMinutes();
	let dataAboutArcade = null;

	if (dateNowHHNN < 1200 && dateNowHHNN >= 600)
		textToSayHello = "Доброе утро";
	else if (dateNowHHNN < 1700 && dateNowHHNN >= 1200)
		textToSayHello = "Добрый день";
	else if (dateNowHHNN < 2200 && dateNowHHNN >= 1700)
		textToSayHello = "Добрый вечер";
	else if (dateNowHHNN >= 2200 || dateNowHHNN < 600)
		textToSayHello = "Доброй ночи";

	try {
		dataAboutUser.userAction = "menuHome";

		dataAboutUser.matchesData.writeIntervalFrom = false;
		dataAboutUser.matchesData.mathArcade.writeIntervalTo = false;

		if (dataAboutUser.currentMatchId) {
			dataAboutArcade = dataAboutUser.matchesData.mathArcade.history.find(
				(obj) => obj.matchId == dataAboutUser.currentMatchId
			);

			dataAboutUser.matchesData.mathArcade.history.splice(
				dataAboutUser.matchesData.mathArcade.history.indexOf(
					dataAboutUser.matchesData.mathArcade.history.find(
						(obj) => obj.countOfAllProblems == 0
					)
				)
			);

			dataAboutUser.matchesData.mathArcade.newRecordAlert = false;

			dataAboutArcade.isOver = true;
			dataAboutUser.currentMatchId = null;
		}

		curriculumCreating(chatId);

		await bot.editMessageText(
			`<b>${textToSayHello}, ${dataAboutUser.login}!\n\n</b><i>(Помощник в раннем доступе)</i><b>\n\nЧем я могу помочь? 🤓</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId)
					.messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "🔥 Аркада 🕹️",
								callback_data: "mathArcade0",
							},
						],
						[
							{
								text: "Учебник 📖",
								callback_data: "soon",
							},
							{
								text: "Достижения🎖️",
								callback_data: "soon",
							},
						],
						[{ text: "Настройки ⚙️", callback_data: "settings" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

function truncateString(text, maxLength) {
	if (text.length > maxLength) {
		return text.substring(0, maxLength - 3) + "...";
	}
	return text;
}

async function topicsList(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		let yourTopicsListText = "";
		for (let i = 0; i < topics.length; i++)
			if (dataAboutUser.matchesData.topicsStatus[i].active)
				yourTopicsListText += `\n- ${topics[i].name}`;

		await bot.editMessageText(
			`<b><i>📚 Выбор определнных тем ✏️</i></b>${
				dataAboutUser.schoolClassNum &&
				!dataAboutUser.matchesData.topicsStatus.every(
					(obj) => !obj.active
				)
					? `\n\n<b>Учебный класс: ${
							dataAboutUser.schoolClassNum == 12
								? `Свой ⚙️`
								: `${dataAboutUser.schoolClassNum}-й`
					  }</b>\n<blockquote><b>Выбранные темы:</b><i>${yourTopicsListText}</i></blockquote>`
					: `\n\nСписок тем пуст.. 🏝️\n`
			}\n<b>${
				dataAboutUser.matchesData.topicsStatus.every(
					(obj) => !obj.active
				)
					? "❗Выбери хотя бы одну из тем ⛔️"
					: !dataAboutUser.schoolClassNum
					? "❗Выбери класс или одну из тем ⛔️"
					: "Выбери нужные темы из списка ниже! 😉"
			}</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId)
					.messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: `Все доступные темы ⬇️`,
								callback_data: "-",
							},
						],
						[
							{
								text: `${topics[0].name} ${
									dataAboutUser.matchesData.topicsStatus[0]
										.active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${0}`,
							},
							{
								text: `${topics[1].name} ${
									dataAboutUser.matchesData.topicsStatus[1]
										.active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${1}`,
							},
						],
						[
							{
								text: `${topics[2].name} ${
									dataAboutUser.matchesData.topicsStatus[2]
										.active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${2}`,
							},
							{
								text: `${topics[3].name} ${
									dataAboutUser.matchesData.topicsStatus[3]
										.active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${3}`,
							},
						],
						[
							{
								text: `${topics[4].name} ${
									dataAboutUser.matchesData.topicsStatus[4]
										.active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${4}`,
							},
							{
								text: `${topics[6].name} ${
									dataAboutUser.matchesData.topicsStatus[6]
										.active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${6}`,
							},
						],
						[
							{
								text: `${topics[5].name} ${
									dataAboutUser.matchesData.topicsStatus[5]
										.active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${5}`,
							},

							{
								text: `${topics[7].name} ${
									dataAboutUser.matchesData.topicsStatus[7]
										.active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${7}`,
							},
						],
						[
							{
								text: `${topics[8].name} ${
									dataAboutUser.matchesData.topicsStatus[8]
										.active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${8}`,
							},
						],

						[
							{
								text:
									dataAboutUser.schoolClassNum == 12
										? `• ⚙️ •`
										: ``,
								callback_data:
									dataAboutUser.schoolClassNum == 12
										? `-`
										: `-`,
							},
							{
								text:
									dataAboutUser.schoolClassNum == 8
										? `• 8-й •`
										: `8-й`,
								callback_data:
									dataAboutUser.schoolClassNum == 8
										? `-`
										: "setSchoolClassNum8InTopicsList",
							},
							{
								text:
									dataAboutUser.schoolClassNum == 9
										? `• 9-й •`
										: `9-й`,
								callback_data:
									dataAboutUser.schoolClassNum == 9
										? `-`
										: "setSchoolClassNum9InTopicsList",
							},
							{
								text:
									dataAboutUser.schoolClassNum == 10
										? `• 10-й •`
										: `10-й`,
								callback_data:
									dataAboutUser.schoolClassNum == 10
										? `-`
										: "setSchoolClassNum10InTopicsList",
							},
						],
						[
							{
								text: "⬅️Назад",
								callback_data:
									dataAboutUser.userAction == "mathArcade0"
										? "mathArcade0"
										: dataAboutUser.userAction ==
										  "firstMeeting4"
										? `firstMeeting4`
										: dataAboutUser.userAction == "settings"
										? `settings`
										: "-",
							},

							{
								text:
									dataAboutUser.matchesData.topicsStatus.every(
										(obj) => !obj.active
									) || !dataAboutUser.schoolClassNum
										? "⛔️"
										: "🔄️",
								callback_data:
									dataAboutUser.matchesData.topicsStatus.every(
										(obj) => !obj.active
									) || !dataAboutUser.schoolClassNum
										? "-"
										: "deselectAllTopics",
							},
							{
								text:
									dataAboutUser.matchesData.topicsStatus.every(
										(obj) => !obj.active
									) || !dataAboutUser.schoolClassNum
										? "Нельзя ⛔️"
										: "Принять ✅",
								callback_data:
									dataAboutUser.matchesData.topicsStatus.every(
										(obj) => !obj.active
									) || !dataAboutUser.schoolClassNum
										? "-"
										: dataAboutUser.userAction ==
										  "mathArcade0"
										? "mathArcade0"
										: dataAboutUser.userAction ==
										  "firstMeeting4"
										? `exit`
										: dataAboutUser.userAction == "settings"
										? `settings`
										: "-",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function curriculumCreating(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		switch (dataAboutUser.schoolClassNum) {
			case 8:
				for (let i = 0; i < topics.length; i++)
					if (i <= 3)
						dataAboutUser.matchesData.topicsStatus[i].active = true;
					else
						dataAboutUser.matchesData.topicsStatus[
							i
						].active = false;

				break;
			case 9:
				for (let i = 0; i < topics.length; i++)
					if (i <= 5)
						dataAboutUser.matchesData.topicsStatus[i].active = true;
					else
						dataAboutUser.matchesData.topicsStatus[
							i
						].active = false;

				break;
			case 10:
				for (let i = 0; i < topics.length; i++)
					if (i <= 10)
						dataAboutUser.matchesData.topicsStatus[i].active = true;
					else
						dataAboutUser.matchesData.topicsStatus[
							i
						].active = false;

				break;
			case 11:
				for (let i = 0; i < topics.length; i++)
					if (i <= 10)
						dataAboutUser.matchesData.topicsStatus[i].active = true;
					else
						dataAboutUser.matchesData.topicsStatus[
							i
						].active = false;

				//TODO: ТЕМЫ 11 КЛАССА
				break;
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

function calculate(chatId, number1 = null, number2 = null) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	number1 = number1 ? number1 : dataAboutUser.matchesData.number1;
	number2 = number2 ? number2 : dataAboutUser.matchesData.number2;

	try {
		if (!isNaN(number1) && !isNaN(number2)) {
			switch (dataAboutUser.matchesData.topicNum) {
				case 1:
					return number1 + number2;
				case 2:
					return number1 - number2;
				case 3:
					if (number1 * number2 <= 10000) {
						// Ограничение на произведение
						return number1 * number2;
					} else return NaN;
				case 4:
					if (number2 !== 0 && number1 % number2 === 0) {
						// Убедиться, что нет деления на ноль
						return number1 / number2;
					} else return NaN;
				case 5:
					return number1 ** 2;
				case 6:
					if (number1 > 1 && Number.isInteger(Math.sqrt(number1))) {
						return Math.sqrt(number1);
					} else return NaN;
				case 7:
					return number1 ** 3;
				case 8:
					if (number1 > 1 && Number.isInteger(Math.cbrt(number1))) {
						return Math.cbrt(number1);
					} else return NaN;
				case 9:
					if (number1 > 0 && number1 <= 10) {
						// Лимит для факториалов
						let result = 1;
						for (let i = 2; i <= number1; i++) {
							result *= i;
						}
						return result;
					} else return NaN;
				case 10:
					break;
				case 11:
					break;
			}
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

function adjustInterval(chatId, number) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		let topic = dataAboutUser.matchesData.topicNum;

		// Для факториала ограничиваем число до 10
		if (topic === 9 && Math.abs(number) > 10) return 10;

		// Ограничения для квадратных и кубических корней
		if ((topic === 6 || topic === 8) && Math.abs(number) > 100) {
			return Math.sign(number) * 100; // Лимитируем корни
		}

		// Ограничения для кубов
		if (topic === 7 && Math.abs(number) > 50) {
			return Math.sign(number) * 50; // Ограничение куба числа
		}

		// Общие действия для остальных операций
		if (Math.abs(number) <= 50) {
			switch (topic) {
				case 5:
					return number / 2; // Квадрат
				case 6:
					return Math.pow(number / 2, 2) * Math.sign(number); // Квадратный корень
				case 7:
					return (
						Math.sign(number) * Math.pow(Math.abs(number), 1 / 3)
					); // Кубический корень
				case 8:
					return (
						Math.sign(number) * Math.pow(Math.abs(number) / 3, 3)
					); // Куб
			}
		} else if (Math.abs(number) > 50 && Math.abs(number) <= 100) {
			switch (topic) {
				case 3:
					return number / 2; // Умножение
				case 5:
					return number / 3;
				case 7:
					return (
						Math.sign(number) * Math.pow(Math.abs(number), 1 / 3)
					); // Кубический корень
			}
		} else if (Math.abs(number) > 100 && Math.abs(number) <= 1000) {
			switch (topic) {
				case 3:
					return number / 4; // Умножение
				case 7:
					return (
						Math.sign(number) * Math.pow(Math.abs(number) / 2, 3)
					); // Кубы
			}
		} else if (Math.abs(number) > 1000) {
			switch (topic) {
				case 3:
					return number / 5; // Умножение: ограничение
				case 7:
					return (
						Math.sign(number) * Math.pow(Math.abs(number) / 10, 3)
					); // Жесткое ограничение для кубов
			}
		}

		return number; // Если нет специальных условий
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function numbersGenerator(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		let number1 = 0;
		let number2 = 0;
		let count = 0;
		let count2 = 0; // Для отслеживания смены действий

		// Получаем интервалы с использованием функции adjustInterval
		const intervalFrom = Math.floor(
			await adjustInterval(chatId, dataAboutUser.matchesData.intervalFrom)
		);
		const intervalTo = Math.floor(
			await adjustInterval(chatId, dataAboutUser.matchesData.intervalTo)
		);

		do {
			number1 =
				Math.floor(Math.random() * (intervalTo - intervalFrom + 1)) +
				intervalFrom;
			number2 =
				Math.floor(Math.random() * (intervalTo - intervalFrom + 1)) +
				intervalFrom;

			count++;

			if (count >= 10000) {
				count2++;
				count = 0; // Сброс счётчика попыток

				if (count2 >= 100) {
					console.log("Превышен лимит смены действий");
					dataAboutUser.matchesData.number1 = null;
					dataAboutUser.matchesData.number2 = null;
					mathArcade(chatId, 0, null, null, true);
					return;
				}

				// Выбор нового действия из активных тем
				do {
					dataAboutUser.matchesData.topicNum =
						Math.floor(Math.random() * topics.length) + 1;
				} while (
					!dataAboutUser.matchesData.topicsStatus[
						dataAboutUser.matchesData.topicNum - 1
					].active
				);
			}
		} while (
			isNaN(await calculate(chatId, number1, number2)) || // Проверка на NaN
			number1 === number2 || // Проверка на одинаковые числа
			Math.abs(number1) === 0 ||
			Math.abs(number1) === 1 || // Исключаем нули и единицы
			Math.abs(number2) === 0 ||
			Math.abs(number2) === 1
		);

		// Сохраняем сгенерированные числа
		dataAboutUser.matchesData.number1 = number1;
		dataAboutUser.matchesData.number2 = number2;
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function mathProblemGenerator(chatId, certainTopicNum = null) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	dataAboutUser.matchesData.mathProblemSentence = null;

	try {
		if (certainTopicNum)
			dataAboutUser.matchesData.topicNum = certainTopicNum;
		else {
			do {
				dataAboutUser.matchesData.topicNum =
					Math.floor(Math.random() * topics.length) + 1;
			} while (
				!dataAboutUser.matchesData.topicsStatus[
					dataAboutUser.matchesData.topicNum - 1
				].active
			);
		}

		await numbersGenerator(chatId);

		if (
			dataAboutUser.matchesData.number1 ||
			dataAboutUser.matchesData.number2
		) {
			dataAboutUser.matchesData.result = calculate(chatId);

			//? СОЗДАНИЕ СТРОЧКИ С ПРИМЕРОМ

			switch (dataAboutUser.matchesData.topicNum) {
				case 1:
					dataAboutUser.matchesData.mathProblemSentence =
						`${
							dataAboutUser.matchesData.number1 < 0
								? `(${dataAboutUser.matchesData.number1})`
								: dataAboutUser.matchesData.number1
						}` +
						` ${
							topics[dataAboutUser.matchesData.topicNum - 1]
								.symbol
						} ` +
						`${
							dataAboutUser.matchesData.number2 < 0
								? `(${dataAboutUser.matchesData.number2})`
								: dataAboutUser.matchesData.number2
						}`;
					break;
				case 2:
					dataAboutUser.matchesData.mathProblemSentence =
						`${
							dataAboutUser.matchesData.number1 < 0
								? `(${dataAboutUser.matchesData.number1})`
								: dataAboutUser.matchesData.number1
						}` +
						` ${
							topics[dataAboutUser.matchesData.topicNum - 1]
								.symbol
						} ` +
						`${
							dataAboutUser.matchesData.number2 < 0
								? `(${dataAboutUser.matchesData.number2})`
								: dataAboutUser.matchesData.number2
						}`;
					break;
				case 3:
					dataAboutUser.matchesData.mathProblemSentence =
						`${
							dataAboutUser.matchesData.number1 < 0
								? `(${dataAboutUser.matchesData.number1})`
								: dataAboutUser.matchesData.number1
						}` +
						` ${
							topics[dataAboutUser.matchesData.topicNum - 1]
								.symbol
						} ` +
						`${
							dataAboutUser.matchesData.number2 < 0
								? `(${dataAboutUser.matchesData.number2})`
								: dataAboutUser.matchesData.number2
						}`;
					break;
				case 4:
					dataAboutUser.matchesData.mathProblemSentence =
						`${
							dataAboutUser.matchesData.number1 < 0
								? `(${dataAboutUser.matchesData.number1})`
								: dataAboutUser.matchesData.number1
						}` +
						` ${
							topics[dataAboutUser.matchesData.topicNum - 1]
								.symbol
						} ` +
						`${
							dataAboutUser.matchesData.number2 < 0
								? `(${dataAboutUser.matchesData.number2})`
								: dataAboutUser.matchesData.number2
						}`;
					break;
				case 5:
					dataAboutUser.matchesData.mathProblemSentence =
						`${
							dataAboutUser.matchesData.number1 < 0
								? `(${dataAboutUser.matchesData.number1})`
								: dataAboutUser.matchesData.number1
						}` +
						`${
							topics[dataAboutUser.matchesData.topicNum - 1]
								.symbol
						}`;
					break;
				case 6:
					dataAboutUser.matchesData.mathProblemSentence =
						`${
							topics[dataAboutUser.matchesData.topicNum - 1]
								.symbol
						}` + dataAboutUser.matchesData.number1;
					break;
				case 7:
					dataAboutUser.matchesData.mathProblemSentence =
						`${
							dataAboutUser.matchesData.number1 < 0
								? `(${dataAboutUser.matchesData.number1})`
								: dataAboutUser.matchesData.number1
						}` +
						`${
							topics[dataAboutUser.matchesData.topicNum - 1]
								.symbol
						}`;
					break;
				case 8:
					dataAboutUser.matchesData.mathProblemSentence =
						`${
							topics[dataAboutUser.matchesData.topicNum - 1]
								.symbol
						}` + dataAboutUser.matchesData.number1;
					break;
				case 9:
					dataAboutUser.matchesData.mathProblemSentence =
						dataAboutUser.matchesData.number1 +
						`${
							topics[dataAboutUser.matchesData.topicNum - 1]
								.symbol
						}`;
					break;
				// TODO
				case 10:
					break;
				case 11:
					break;
			}
		} else {
			dataAboutUser.matchesData.mathProblemSentence = null;
			dataAboutUser.matchesData.result = null;
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function mathArcadeMenu(chatId, numOfStage = 0) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	dataAboutUser.userAction = `mathArcadeMenu${numOfStage}`;
	switch (numOfStage) {
		case 0:
			await bot.editMessageText(
				`<b><i>🔥 Аркада 🕹️</i></b>\n\n<b>Аркада в Алгебравичке</b> - мощный генератор случайных примеров по сложности. Твоя задача решать задачки без использования калькулятора и делать это как можно точнее! Попробуй побить рекорд лучших игроков! 🎖️\n\n<b><a href="https://t.me/${BotName}/?start=soon">Топ игроков</a>\n\nВыбери режим прохождения аркады 🤔</b>`,
				{
					parse_mode: "html",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "В одиночку 👤",
									callback_data: "mathArcade0",
								},
								// { text: "Вдвоем 👥", callback_data: "mathArcadeMenu1" },
							],
							[{ text: "⬅️Назад", callback_data: "exit" }],
						],
					},
				}
			);
			break;
		case 1:
			let dataAboutInvitedPlayers = null,
				text = "";
			if (dataAboutUser.matchesData.mathArcade.invitedPlayers) {
				dataAboutInvitedPlayers =
					dataAboutUser.matchesData.mathArcade.invitedPlayers;

				for (let i = 0; i < dataAboutInvitedPlayers.length; i++) {
					let dataAboutCertainUser = usersData.find(
						(obj) =>
							obj.chatId ==
							dataAboutUser.matchesData.mathArcade.invitedPlayers[
								i
							].chatId
					);

					text += `<b><a href="https://t.me/${BotName}/?start=deleteInvitedPlayerWithId${
						dataAboutCertainUser.chatId
					}">❌</a> ${i + 1}. <a href="tg://user?id=${
						dataAboutCertainUser.chatId
					}">${dataAboutCertainUser.login}</a>${
						dataAboutCertainUser.matchesData.statistics
							.totalAccuracy
							? ` | ${dataAboutCertainUser.matchesData.statistics.totalAccuracy}%`
							: ``
					}</b>\n\n`;
				}
			}

			await bot.editMessageText(
				`<b><i>🔥 Аркада • Приглашение 📧</i></b>${
					dataAboutUser.matchesData.mathArcade.invitedPlayers[0]
						? `\n\n<b>Список игроков:</b>\n${text}`
						: `\n\n`
				}<b>Отправь контакт или Id соперника, и мы начнем! 😉</b>`,
				{
					parse_mode: "html",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "⬅️Назад",
									callback_data: "mathArcadeMenu0",
								},
								{
									text: "Создать✅",
									callback_data: "mathArcadeMenu0",
								},
							],
						],
					},
				}
			);
			break;
	}
}

async function mathArcade(
	chatId,
	numOfStage = 0,
	generateNew = true,
	topicsListActive = false,
	generateError = false
) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	let dataAboutArcade = null;

	if (dataAboutUser.currentMatchId)
		dataAboutArcade = dataAboutUser.matchesData.mathArcade.history.find(
			(obj) => obj.matchId == dataAboutUser.currentMatchId
		);

	try {
		dataAboutUser.userAction = `mathArcade${numOfStage}`;

		await curriculumCreating(chatId);

		let generatorLevel = dataAboutUser.matchesData.generatorLevel;

		switch (numOfStage) {
			case 0:
				// `if (dataAboutUser.currentMatchId) {
				// 	dataAboutArcade.countOfCorrect = 0;
				// 	dataAboutArcade.countOfAllProblems = 0;
				// 	dataAboutArcade.recordInThisMatch = false;

				// 	dataAboutArcade.isOver = true;
				// 	dataAboutUser.currentMatchId = null;
				// }`

				if (generatorLevel != 0) {
					dataAboutUser.matchesData.intervalFrom =
						generatorLevel == 1
							? -25
							: generatorLevel == 2
							? -50
							: generatorLevel == 3
							? -100
							: generatorLevel == 4
							? -200
							: generatorLevel == 5
							? -300
							: null;
					dataAboutUser.matchesData.intervalTo =
						generatorLevel == 1
							? 25
							: generatorLevel == 2
							? 50
							: generatorLevel == 3
							? 100
							: generatorLevel == 4
							? 200
							: generatorLevel == 5
							? 300
							: null;
				}

				let yourTopicsListText = "";
				let count = 0;
				for (let i = 0; i < topics.length; i++)
					if (dataAboutUser.matchesData.topicsStatus[i].active) {
						yourTopicsListText += `\n- ${topics[i].name}`;
						++count;
					}

				await bot.editMessageText(
					`<b><i>🔥 Аркада • Параметры ⚙️</i></b>\n\nГенерация чисел: <b>${
						generatorLevel == 0
							? `Своя ⚙️`
							: `${
									generatorLevel >= 4 ? "🔥" : ""
							  }${generatorLevel} ур `
					}</b>\nЧисла <b>от ${
						dataAboutUser.matchesData.intervalFrom
					} до ${dataAboutUser.matchesData.intervalTo}</b>${
						dataAboutUser.schoolClassNum &&
						!dataAboutUser.matchesData.topicsStatus.every(
							(obj) => !obj.active
						)
							? topicsListActive
								? `\n<blockquote><b>Включенные темы:</b><i>${yourTopicsListText}</i>${
										count > 1
											? `\n<b><a href = "https://t.me/${BotName}/?start=topicsListHideInMathArcade0">Скрыть список</a></b>`
											: ``
								  }</blockquote>`
								: `\n<blockquote><b>Включенные темы:</b><i>${truncateString(
										yourTopicsListText,
										22
								  )}</i>${
										count > 1
											? `\n<b><a href = "https://t.me/${BotName}/?start=topicsListShowInMathArcade0">Раскрыть список</a></b>`
											: ``
								  }</blockquote>`
							: ``
					}<b>${
						dataAboutUser.matchesData.intervalFromError ||
						dataAboutUser.matchesData.intervalToError
							? "\n\n❗Промежуток ОТ должен быть меньше и не равен промежутку ДО ⛔️"
							: !dataAboutUser.schoolClassNum
							? "\n\n❗Выбери класс или одну из тем ⛔️"
							: dataAboutUser.matchesData.topicsStatus.every(
									(obj) => !obj.active
							  )
							? "\n\n❗Выбери хотя бы одну из тем ⛔️"
							: generateError
							? `\n\n❗Попытка бесконечной генерации ⛔️`
							: `\n\nЕсли требуется, измени параметры, и начинай считать! 😉`
					}</b>`,
					{
						parse_mode: "html",
						chat_id: chatId,
						message_id: usersData.find(
							(obj) => obj.chatId == chatId
						).messageId,
						disable_web_page_preview: true,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: `Уровень генерации чисел`,
										callback_data: "-",
									},
								],
								[
									{
										text: `⬅️`,
										callback_data: `setLevel${
											generatorLevel - 1
										}InMathArcade0`,
									},
									{
										text: `${
											generatorLevel != 0
												? `${
														generatorLevel >= 4
															? "🔥"
															: ""
												  }${generatorLevel} ур`
												: `Свой ⚙️`
										} `,
										callback_data: "-",
									},
									{
										text: `➡️`,
										callback_data: `setLevel${
											generatorLevel + 1
										}InMathArcade0`,
									},
								],
								[
									{
										text: dataAboutUser.matchesData
											.writeIntervalFrom
											? `от ... ❌`
											: `${
													dataAboutUser.matchesData
														.intervalFromError
														? "⛔️ "
														: ""
											  }от ${
													dataAboutUser.matchesData
														.intervalFrom
											  } ✏️`,
										callback_data:
											"toggleWriteIntervalFrom",
									},
									{
										text: dataAboutUser.matchesData
											.writeIntervalTo
											? `до ... ❌`
											: `${
													dataAboutUser.matchesData
														.intervalToError
														? "⛔️ "
														: ""
											  }до ${
													dataAboutUser.matchesData
														.intervalTo
											  } ✏️`,
										callback_data: "toggleWriteIntervalTo",
									},
								],
								[
									{
										text: "Учебный класс",
										callback_data: "-",
									},
								],
								[
									{
										text:
											dataAboutUser.schoolClassNum == 12
												? `• ⚙️ •`
												: ``,
										callback_data:
											dataAboutUser.schoolClassNum == 12
												? `-`
												: `-`,
									},
									{
										text:
											dataAboutUser.schoolClassNum == 8
												? `• 8-й •`
												: `8-й`,
										callback_data:
											dataAboutUser.schoolClassNum == 8
												? `-`
												: "setSchoolClassNum8InMathArcade0",
									},
									{
										text:
											dataAboutUser.schoolClassNum == 9
												? `• 9-й •`
												: `9-й`,
										callback_data:
											dataAboutUser.schoolClassNum == 9
												? `-`
												: "setSchoolClassNum9InMathArcade0",
									},
									{
										text:
											dataAboutUser.schoolClassNum == 10
												? `• 10-й •`
												: `10-й`,
										callback_data:
											dataAboutUser.schoolClassNum == 10
												? `-`
												: "setSchoolClassNum10InMathArcade0",
									},
								],
								[
									{
										text: "Открыть список тем ➡️",
										callback_data: "topicsList",
									},
								],
								[
									{
										text: "⬅️Назад",
										callback_data: "exit",
									},
									{
										text:
											dataAboutUser.matchesData
												.intervalFromError ||
											dataAboutUser.matchesData
												.intervalToError ||
											!dataAboutUser.schoolClassNum ||
											dataAboutUser.matchesData.topicsStatus.every(
												(obj) => !obj.active
											)
												? "Нельзя ⛔️"
												: "Поехали 🚀",
										callback_data:
											dataAboutUser.matchesData
												.intervalFromError ||
											dataAboutUser.matchesData
												.intervalToError ||
											!dataAboutUser.schoolClassNum ||
											dataAboutUser.matchesData.topicsStatus.every(
												(obj) => !obj.active
											)
												? "-"
												: "mathArcade1",
									},
								],
							],
						},
					}
				);
				break;
			case 1:
				if (generateNew) await mathProblemGenerator(chatId);

				if (dataAboutUser.matchesData.mathProblemSentence != null) {
					if (!dataAboutUser.currentMatchId) {
						do {
							rndId = Math.floor(Math.random() * 100000);
						} while (
							dataAboutUser.matchesData.mathArcade.history.some(
								(matchData) => matchData.matchId == rndId
							) &&
							dataAboutUser.matchesData.mathArcade.history
								.length != 0
						);

						await dataAboutUser.matchesData.mathArcade.history.push(
							{
								matchId: rndId,
								startTime: new Date(),
								allTime: 0,

								// ДЛЯ ПАРНЫХ СРАЖЕНИЙ
								squadLeaderId:
									dataAboutUser.matchesData.mathArcade
										.squadLeaderId,
								invitedPlayers:
									dataAboutUser.matchesData.mathArcade
										.invitedPlayers,

								// СЧЕТЧИКИ
								comboOfCorrect: 0,
								comboOfIncorrect: 0,
								maxComboOfCorrect: 0,
								countOfCorrect: 0,
								countOfAllProblems: 0,
								accuracy: 0,

								// ИСТОРИЯ ПРИМЕРОВ В ЭТОМ МАТЧЕ
								mathProblemsHistory: [],

								// ПАРАМЕТРЫ ПРИ СОЗДАНИИ
								settings: {
									generatorLevel:
										dataAboutUser.matchesData
											.generatorLevel,
									intervalFrom:
										dataAboutUser.matchesData.intervalFrom,
									intervalTo:
										dataAboutUser.matchesData.intervalTo,

									topicsStatus:
										dataAboutUser.matchesData.topicsStatus,
								},

								// СТАТУСЫ
								recordInThisMatch: false,
								isOver: false,
							}
						);

						dataAboutUser.currentMatchId = rndId;
					}
					if (dataAboutUser.currentMatchId)
						dataAboutArcade =
							dataAboutUser.matchesData.mathArcade.history.find(
								(obj) =>
									obj.matchId == dataAboutUser.currentMatchId
							);

					//////////

					if (dataAboutArcade.countOfAllProblems > 0)
						dataAboutArcade.accuracy = Math.floor(
							(dataAboutArcade.countOfCorrect /
								dataAboutArcade.countOfAllProblems) *
								100
						);

					generatorLevel = dataAboutArcade.settings.generatorLevel;

					await bot.editMessageText(
						`<b><i>🔥 Аркада 🕹️</i></b>\n\nСложность: <b>${
							generatorLevel == 0
								? "Своя ⚙️"
								: `${generatorLevel}-я`
						} <i>(от ${dataAboutArcade.settings.intervalFrom} до ${
							dataAboutArcade.settings.intervalTo
						})</i>\n</b>Решено: <b>${
							dataAboutArcade.countOfCorrect
						} из ${dataAboutArcade.countOfAllProblems}${
							dataAboutUser.matchesData.mathArcade
								.maxComboOfCorrect != 0
								? dataAboutUser.matchesData.mathArcade
										.newRecordAlert
									? `\n\nНовый рекорд! 🎉`
									: `</b>\n\nЛучшая серия: <b>${dataAboutUser.matchesData.mathArcade.maxComboOfCorrect}x 🏆`
								: dataAboutArcade.comboOfCorrect != 0 &&
								  dataAboutUser.matchesData.mathArcade
										.maxComboOfCorrect == 0
								? `\n`
								: ``
						}${
							dataAboutUser.matchesData.mathArcade
								.previousMatchIsOverAlert
								? `</b><i>\n\nЗавершенная аркада сохранена в "Истории", новый уровень: ${generatorLevel}-й</i><b>`
								: `${
										dataAboutArcade.comboOfCorrect != 0
											? `\nПодряд ( ${
													dataAboutArcade.comboOfCorrect
											  }x ) ${
													dataAboutArcade.comboOfCorrect >=
													15
														? "🔥"
														: dataAboutArcade.comboOfCorrect >=
														  10
														? "🤯"
														: dataAboutArcade.comboOfCorrect >=
														  5
														? "😮"
														: ""
											  }${
													dataAboutArcade.comboOfCorrect >=
														5 &&
													dataAboutArcade.settings
														.generatorLevel != 5 &&
													dataAboutArcade.settings
														.generatorLevel != 0
														? `\n<a href="https://t.me/${BotName}/?start=setLevel${
																dataAboutArcade
																	.settings
																	.generatorLevel +
																1
														  }InMathArcade1">Начать снова, но посложней</a>`
														: ``
											  }`
											: dataAboutArcade.comboOfIncorrect >=
													3 &&
											  generatorLevel != 1 &&
											  generatorLevel != 0
											? `${
													dataAboutUser.matchesData
														.mathArcade
														.maxComboOfCorrect == 0
														? "\n"
														: ""
											  }\n<a href="https://t.me/${BotName}/?start=setLevel${
													generatorLevel - 1
											  }InMathArcade1">Начать снова, но полегче</a>`
											: ``
								  }`
						}\n\nРеши пример:<blockquote>${
							dataAboutUser.matchesData.mathProblemSentence
						} = ...  <a href="1">💡</a></blockquote></b><i>Тема: <b>"${
							topics[dataAboutUser.matchesData.topicNum - 1].name
						}"</b></i>`,
						{
							parse_mode: "html",
							chat_id: chatId,
							message_id: usersData.find(
								(obj) => obj.chatId == chatId
							).messageId,
							disable_web_page_preview: true,
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "❌",
											callback_data: `warningExitMathArcadeTo"mathArcade3"`,
										},
										{
											text: `${
												dataAboutArcade.accuracy
													? `${dataAboutArcade.accuracy}`
													: "0"
											}% 🎯`,
											callback_data: `trueAlertAbout"accuracy"`,
										},
										{
											text: "➡️",
											callback_data:
												dataAboutArcade.comboOfCorrect !=
												0
													? `warningExitMathArcadeTo"nextMathProblemGeneration1"`
													: "nextMathProblemGeneration1",
										},
									],
									// [
									// 	{
									// 		text: "Решить с ИИ ✨",
									// 		callback_data:
									// 			dataAboutArcade.comboOfCorrect !=
									// 			0
									// 				? `warningExitMathArcadeTo"nextMathProblemGeneration1"`
									// 				: "nextMathProblemGeneration1",
									// 	},
									// ],
								],
							},
						}
					);

					dataAboutUser.matchesData.mathArcade.previousMatchIsOverAlert = false;
				}
				break;
			case 2:
				if (dataAboutUser.currentMatchId != null)
					dataAboutArcade =
						dataAboutUser.matchesData.mathArcade.history.find(
							(obj) => obj.matchId == dataAboutUser.currentMatchId
						);

				if (
					dataAboutUser.matchesData.enteredResult ==
					dataAboutUser.matchesData.result
				) {
					rndNum = Math.floor(
						Math.random() * motivationPhrases.length
					);

					++dataAboutUser.matchesData.topicsStatus[
						dataAboutUser.matchesData.topicNum - 1
					].countOfCorrect;
					++dataAboutUser.matchesData.topicsStatus[
						dataAboutUser.matchesData.topicNum - 1
					].countOfAllProblems;
					++dataAboutArcade.countOfCorrect;
					++dataAboutArcade.countOfAllProblems;

					++dataAboutArcade.comboOfCorrect;
					dataAboutArcade.comboOfIncorrect = 0;

					if (
						dataAboutArcade.comboOfCorrect >
						dataAboutUser.matchesData.mathArcade.maxComboOfCorrect
					) {
						dataAboutUser.matchesData.mathArcade.maxComboOfCorrect =
							dataAboutArcade.comboOfCorrect;
						dataAboutArcade.recordInThisMatch = true;
						dataAboutUser.matchesData.mathArcade.newRecordAlert = true;
					}

					setTimeout(() => {
						if (dataAboutUser.userAction != "menuHome") {
							mathArcade(chatId, 1);
						}
					}, 2500);
				} else {
					++dataAboutArcade.countOfAllProblems;

					dataAboutUser.matchesData.mathArcade.newRecordAlert = false;

					dataAboutArcade.comboOfCorrect = 0;
					++dataAboutArcade.comboOfIncorrect;
				}

				if (dataAboutArcade.countOfAllProblems > 0)
					dataAboutArcade.accuracy = Math.floor(
						(dataAboutArcade.countOfCorrect /
							dataAboutArcade.countOfAllProblems) *
							100
					);

				dataAboutUser.userAction = "mathArcade2";

				await bot.editMessageText(
					`<b><i>🔥 Аркада 🕹️</i></b>\n\nСложность: <b>${
						generatorLevel == 0 ? "Своя ⚙️" : `${generatorLevel}-я`
					}\n</b>Решено: <b>${dataAboutArcade.countOfCorrect} из ${
						dataAboutArcade.countOfAllProblems
					}${
						dataAboutUser.matchesData.mathArcade
							.maxComboOfCorrect != 0
							? dataAboutUser.matchesData.mathArcade
									.newRecordAlert
								? `\n\nНовый рекорд! 🎉`
								: `</b>\n\nЛучшая серия: <b>${dataAboutUser.matchesData.mathArcade.maxComboOfCorrect}x 🏆`
							: dataAboutArcade.comboOfCorrect != 0
							? `\n`
							: ``
					}${
						dataAboutArcade.comboOfCorrect != 0
							? `\nПодряд ( ${
									dataAboutArcade.comboOfCorrect
							  }x ) ${
									dataAboutArcade.comboOfCorrect >= 15
										? "🔥"
										: dataAboutArcade.comboOfCorrect >= 10
										? "🤯"
										: dataAboutArcade.comboOfCorrect >= 5
										? "😮"
										: ""
							  }`
							: ``
					}${
						dataAboutArcade.comboOfIncorrect >= 3 &&
						generatorLevel != 1 &&
						generatorLevel != 0
							? `${
									dataAboutUser.matchesData.mathArcade
										.maxComboOfCorrect == 0
										? "\n"
										: ""
							  }\n<a href="https://t.me/${BotName}/?start=setLevel${
									generatorLevel - 1
							  }InMathArcade1">Начать снова, но полегче</a>`
							: ``
					}\n\nРешение:<blockquote>${
						dataAboutUser.matchesData.mathProblemSentence
					} ${
						dataAboutUser.matchesData.enteredResult ==
						dataAboutUser.matchesData.result
							? "="
							: `≠`
					} ${dataAboutUser.matchesData.enteredResult} ${
						dataAboutUser.matchesData.enteredResult ==
						dataAboutUser.matchesData.result
							? `✅ Верно`
							: `❌ Неверно\nОтвет: ${dataAboutUser.matchesData.result}`
					}</blockquote></b><i>Тема: <b>"${
						topics[dataAboutUser.matchesData.topicNum - 1].name
					}"</b></i>`,
					{
						parse_mode: "html",
						chat_id: chatId,
						message_id: usersData.find(
							(obj) => obj.chatId == chatId
						).messageId,
						disable_web_page_preview: true,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text:
											dataAboutUser.matchesData
												.enteredResult ==
											dataAboutUser.matchesData.result
												? motivationPhrases[rndNum]
												: "❌",
										callback_data: `${
											dataAboutUser.matchesData
												.enteredResult ==
											dataAboutUser.matchesData.result
												? "-"
												: `warningExitMathArcadeTo"mathArcade3"`
										}`,
									},
									{
										text:
											dataAboutUser.matchesData
												.enteredResult ==
											dataAboutUser.matchesData.result
												? ""
												: `${
														dataAboutArcade.accuracy
															? `${dataAboutArcade.accuracy}`
															: "0"
												  }% 🎯`,
										callback_data: `trueAlertAbout"accuracy"`,
									},
									{
										text:
											dataAboutUser.matchesData
												.enteredResult ==
											dataAboutUser.matchesData.result
												? ""
												: "➡️",
										callback_data: `nextMathProblemGeneration2`,
									},
								],
							],
						},
					}
				);
				break;
			case 3:
				console.log("Матч в массиве завершен");

				if (dataAboutUser.currentMatchId) {
					dataAboutArcade =
						dataAboutUser.matchesData.mathArcade.history.find(
							(obj) => obj.matchId == dataAboutUser.currentMatchId
						);

					dataAboutUser.currentMatchId = null;
				}

				dataAboutUser.matchesData.mathArcade.newRecordAlert = false;
				dataAboutArcade.isOver = true;

				dataAboutArcade.allTime = new Date(
					Math.floor(
						(new Date() - dataAboutArcade.startTime) / 1000
					) * 1000
				)
					.toISOString()
					.substr(14, 5);

				dataAboutUser.matchesData.statistics.totalProblems +=
					dataAboutArcade.countOfAllProblems;
				dataAboutUser.matchesData.statistics.totalCorrectProblems +=
					dataAboutArcade.countOfCorrect;

				dataAboutUser.matchesData.statistics.totalAccuracy = Math.floor(
					(dataAboutUser.matchesData.statistics.totalCorrectProblems /
						dataAboutUser.matchesData.statistics.totalProblems) *
						100
				);

				if (dataAboutArcade.countOfAllProblems > 0)
					dataAboutArcade.accuracy = Math.floor(
						(dataAboutArcade.countOfCorrect /
							dataAboutArcade.countOfAllProblems) *
							100
					);

				await bot.editMessageText(
					`<b><i>🔥 Аркада 🕹️</i></b>\n\nРезультат: <b>${
						dataAboutArcade.countOfCorrect
					} из ${dataAboutArcade.countOfAllProblems}</b>${
						dataAboutArcade.countOfAllProblems > 0
							? `\nТочность: <b>${dataAboutArcade.accuracy}%</b> 🎯`
							: ``
					}\nВремя: <b>${dataAboutArcade.allTime}${
						dataAboutUser.matchesData.mathArcade
							.maxComboOfCorrect != 0
							? dataAboutArcade.recordInThisMatch
								? `\n\nНовый рекорд! 🎉\n</b>Подряд <b>${
										dataAboutUser.matchesData.mathArcade
											.maxComboOfCorrect
								  } ${
										(dataAboutUser.matchesData.mathArcade
											.maxComboOfCorrect >= 5 &&
											dataAboutUser.matchesData.mathArcade
												.maxComboOfCorrect <= 20) ||
										(dataAboutUser.matchesData.mathArcade
											.maxComboOfCorrect %
											10 >=
											5 &&
											dataAboutUser.matchesData.mathArcade
												.maxComboOfCorrect %
												10 <=
												9) ||
										dataAboutUser.matchesData.mathArcade
											.maxComboOfCorrect %
											10 ==
											0
											? "примеров"
											: `${
													dataAboutUser.matchesData
														.mathArcade
														.maxComboOfCorrect %
														10 ==
													1
														? "пример"
														: `${
																dataAboutUser
																	.matchesData
																	.mathArcade
																	.maxComboOfCorrect %
																	10 >=
																	2 &&
																dataAboutUser
																	.matchesData
																	.mathArcade
																	.maxComboOfCorrect %
																	10 <=
																	4
																	? "примера"
																	: ``
														  }`
											  }`
								  } `
								: `</b>\n\nТекущий рекорд: <b>${dataAboutUser.matchesData.mathArcade.maxComboOfCorrect}x`
							: ``
					}\n\n</b><blockquote><i><b>Подробности аркады:</b></i>\nСложность: <b>${
						generatorLevel == 0 ? "Своя ⚙️" : `${generatorLevel}-я`
					}</b>\nЧисла <b>от ${
						dataAboutArcade.settings.intervalFrom
					} до ${
						dataAboutArcade.settings.intervalTo
					}</b></blockquote>\n<b>${
						dataAboutArcade.accuracy >= 75
							? `Прекрасный результат, давай еще одну? 🤩`
							: dataAboutArcade.accuracy >= 50 &&
							  dataAboutArcade.accuracy < 75
							? `Неплохой результат, еще аркадку? 👍`
							: dataAboutArcade.accuracy < 50
							? `Грустный результат, переиграем? 🫤`
							: ``
					} </b>`,
					{
						parse_mode: "html",
						chat_id: chatId,
						message_id: usersData.find(
							(obj) => obj.chatId == chatId
						).messageId,
						disable_web_page_preview: true,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "Сыграть снова🔄️",
										callback_data: "mathArcade1",
									},
								],
								[
									{ text: "⬅️В меню", callback_data: "exit" },
									{
										text: "История💾",
										callback_data: "arcadesHistory",
									},
								],
							],
						},
					}
				);
				break;
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function warningExitMathArcade(chatId, exitToWhere) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	let dataAboutArcade = null;

	if (dataAboutUser.currentMatchId) {
		dataAboutArcade = dataAboutUser.matchesData.mathArcade.history.find(
			(obj) => obj.matchId == dataAboutUser.currentMatchId
		);
	}

	try {
		await bot.editMessageText(
			`<b>${dataAboutUser.login}, ${
				dataAboutArcade.countOfAllProblems > 0
					? `${
							dataAboutArcade.comboOfCorrect != 0
								? `ты ${
										dataAboutArcade.comboOfCorrect >= 3
											? `прекрасно`
											: dataAboutArcade.comboOfCorrect < 3
											? `неплохо`
											: ""
								  } идешь! 👍`
								: `ошибки бывают всегда, но это не повод сдаваться! 🚀`
					  }`
					: `не вижу твоего настроя.. 🤷‍♂️`
			}</b>\n\nВсего решено: <b>${dataAboutArcade.countOfCorrect} из ${
				dataAboutArcade.countOfAllProblems
			}</b>${
				dataAboutArcade.comboOfCorrect != 0
					? `\n\n<i>Твоя <b>серия из ${
							dataAboutArcade.comboOfCorrect
					  } ${
							(dataAboutArcade.comboOfCorrect >= 5 &&
								dataAboutArcade.comboOfCorrect <= 20) ||
							(dataAboutArcade.comboOfCorrect % 10 >= 5 &&
								dataAboutArcade.comboOfCorrect % 10 <= 9) ||
							dataAboutArcade.comboOfCorrect % 10 == 0
								? "решенных примеров"
								: `${
										dataAboutArcade.comboOfCorrect % 10 == 1
											? "решенного примера"
											: `${
													dataAboutArcade.comboOfCorrect %
														10 >=
														2 &&
													dataAboutArcade.comboOfCorrect %
														10 <=
														4
														? "решенных примеров"
														: ``
											  }`
								  }`
					  }, будет прервана❗</b></i>`
					: ``
			}\n\nДействительно ли ты, <b>хочешь ${
				exitToWhere == "mathArcade3"
					? `завершить прохождение аркады`
					: exitToWhere == "nextMathProblemGeneration1"
					? `перейти к следущему примеру`
					: ``
			}? 🤔</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId)
					.messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "⬅️Вернуться",
								callback_data: "continueMathArcade",
							},
							{
								text: `${
									exitToWhere == "mathArcade3"
										? `Завершить`
										: exitToWhere ==
										  "nextMathProblemGeneration1"
										? `Перейти`
										: ``
								} ❌`,
								callback_data:
									dataAboutArcade.countOfAllProblems == 0 &&
									exitToWhere == "mathArcade3"
										? "exit"
										: exitToWhere,
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function historyList(
	chatId,
	matchId = null,
	listNum = 1,
	stageNum = 1,
	resultsAreActive = false
) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	const arcades = dataAboutUser.matchesData.mathArcade.history;

	try {
		if (matchId) {
			//
		} else {
			switch (listNum) {
				case 1:
					switch (stageNum) {
						case 1:
							let historyText = null;
							for (let i = 0; i < arcadesHistory.length; i++) {
								historyText += arcades[i];
							}
							break;

						case 2:
							break;
					}
					break;
				case 2:
					break;
			}
			await bot.editMessageText(
				`<b><i>⌛️ История ${
					listNum == 1 ? `аркад` : `примеров`
				} 💾</i></b>`,
				{
					parse_mode: "html",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[{ text: "⬅️Назад", callback_data: "exit" }],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function settings(chatId, editLogin = false, afterEdit = false) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	try {
		if (!editLogin) {
			await bot.editMessageText(
				`<b><i>👤 Настройки • <code>${
					dataAboutUser.chatId
				}</code> ⚙️</i>\n\nДанные:\n</b>Логин: <b>${
					dataAboutUser.login
				}</b> - <a href="https://t.me/${BotName}/?start=editLogin">изменить</a>${
					dataAboutUser.phoneNumber
						? `\nТелефон: <b>+${dataAboutUser.phoneNumber}</b>`
						: ``
				}\n\n<b>Статистика:\n</b>Аркад сыграно: <b>${
					dataAboutUser.matchesData.mathArcade.history
						? dataAboutUser.matchesData.mathArcade.history.length
						: 0
				}шт</b>\nРешено примеров: <b>${
					dataAboutUser.matchesData.mathArcade.history &&
					dataAboutUser.matchesData.mathArcade.history.flat()
						.mathProblemsHistory
						? dataAboutUser.matchesData.mathArcade.history
								.flat()
								.mathProblemsHistory.flat().length
						: 0
				}шт</b>\n\n<i>Помощник в раннем доступе!</i> 🫤`,
				{
					parse_mode: "html",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️Назад", callback_data: "exit" },
								{
									text: "digfusion❔",
									callback_data: "digfusionInfo",
								},
							],
						],
					},
				}
			);
		} else if (editLogin) {
			dataAboutUser.userAction = "editLogin";

			await bot.editMessageText(
				`<i><b>🛠️ Изменение логина ⚙️\n\n</b>Логин используется для идентификации пользователя! 🔒</i><b>\n\n${
					afterEdit
						? `Изменённый: <code>${dataAboutUser.supportiveCount}</code>`
						: `Текущий: <code>${dataAboutUser.login}</code>`
				}${
					afterEdit
						? "\n\nПрименить изменения для логина? 🤔"
						: "\n\nНапиши, как можно к тебе обращаться ✍️"
				}</b>`,
				{
					parse_mode: "html",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: `${
										afterEdit ? `⬅️Отменить` : `⬅️Назад`
									}`,
									callback_data: "settings",
								},
								{
									text: `${afterEdit ? "Принять✅" : ""}`,
									callback_data: "editLogin",
								},
								{
									text: `${
										dataAboutUser.login !=
											dataAboutUser.telegramFirstName &&
										!afterEdit
											? "Сбросить 🔄️"
											: ""
									}`,
									callback_data: "resetLogin",
								},
							],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function digfusionInfo(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		await bot.editMessageText(
			`<b><i>❔digfusion • О нас 💁🏻‍♂️</i></b>\n\n<i>Это приложение разработано <b>digfusion</b> с душой 🤍</i>\n\n<b><i>digfusion</i></b> - <b>начинающий стартап,</b> разрабатывающий <b>свои приложения</b> и предоставляющий услуги по <b>созданию чат-ботов</b> различных типов! ☑️\n\nПросмотреть все <b>наши проекты, реальные отзывы, каталог услуг</b> и <b>прочую информацию о компании</b> можно в нашем <b>Telegram канале</b> и <b>боте-консультанте! 🤗\n\n<a href="https://t.me/digfusion">digfusion | инфо</a> • <a href="https://t.me/digfusionbot">digfusion | услуги</a></b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId)
					.messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "Наш Telegram канал 📣",
								url: "https://t.me/digfusion",
							},
						],
						[
							{ text: "⬅️Назад", callback_data: "settings" },
							{
								text: "Поддержка 💭",
								url: "https://t.me/digsupport",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function StartAll() {
	if (TOKEN == config.TOKENs[0]) {
		BotName = "digtestingbot";
	} else if (TOKEN == config.TOKENs[1]) {
		BotName = "digmathbot";
	}

	if (
		fs.readFileSync("DB.json") != "[]" &&
		fs.readFileSync("DB.json") != ""
	) {
		let dataFromDB = JSON.parse(fs.readFileSync("DB.json"));

		usersData = dataFromDB.usersData || null;
	}

	bot.on("contact", async (message) => {
		const chatId = message.chat.id;
		const phoneNumber = message.contact.phone_number;
		const chatIdOther = message.contact.user_id;

		const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

		if (dataAboutUser && dataAboutUser.userAction == "firstMeeting3") {
			dataAboutUser.phoneNumber = phoneNumber;
			с;
			try {
				bot.deleteMessage(chatId, dataAboutUser.messageIdOther);
				bot.deleteMessage(chatId, message.message_id);
			} catch (error) {}

			firstMeeting(chatId, 4);
		}

		if (
			dataAboutUser &&
			dataAboutUser.userAction == "mathArcadeMenu1" &&
			phoneNumber != dataAboutUser.phoneNumber &&
			usersData.find((obj) => obj.phoneNumber == phoneNumber) &&
			!dataAboutUser.matchesData.mathArcade.invitedPlayers.find(
				(obj) => obj.phoneNumber == phoneNumber
			)
		) {
			try {
				bot.deleteMessage(chatId, message.message_id);
			} catch (error) {}

			let dataAboutCertainUser = usersData.find(
				(obj) => obj.phoneNumber == phoneNumber
			);

			if (!dataAboutUser.matchesData.mathArcade.invitedPlayers)
				dataAboutUser.matchesData.mathArcade.invitedPlayers = [];

			await dataAboutUser.matchesData.mathArcade.invitedPlayers.push({
				chatId: dataAboutCertainUser.chatId,
				phoneNumber: dataAboutCertainUser.phoneNumber,
			});

			mathArcadeMenu(chatId, 1);
		}
	});

	bot.on("text", async (message) => {
		const chatId = message.chat.id;
		const text = message.text;

		const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

		try {
			if (!usersData.find((obj) => obj.chatId === chatId)) {
				usersData.push({
					chatId: chatId,
					login: message.from.first_name,
					telegramFirstName: message.from.first_name,
					phoneNumber: null,
					messageId: null,
					userAction: null,
					schoolClassNum: null, //! null
					currentMatchId: null,

					messageIdOther: null,
					supportiveCount: null,

					matchesData: {
						mathProblemSentence: null,
						number1: null,
						number2: null,
						topicNum: null,
						result: null,
						enteredResult: null,
						// TODO УБРАТЬ ВСЕ КАСТОМНЫЕ ЗНАЧЕНИЯ

						generatorLevel: 1,
						intervalFrom: null,
						intervalTo: null,
						writeIntervalFrom: false,
						writeIntervalTo: false,
						intervalFromError: false,
						intervalToError: false,

						mathArcade: {
							maxComboOfCorrect: 0,

							// ALERTS
							newRecordAlert: false,
							previousMatchIsOverAlert: false,

							// SQUAD DATA
							squadLeaderId: null,
							invitedPlayers: [],

							// ALL ARCADES DATA
							history: [],
						},

						//TODO: ПЕРЕДАВИТЬ В ДАННЫЕ ОБ МАТЧЕ ТОЛЬКО ПАРАМЕТР ACTIVE
						topicsStatus: [
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
								accuracy: 0,
							}, // 1	"+",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
								accuracy: 0,
							}, // 2	"-",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
								accuracy: 0,
							}, // 3	"×",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
								accuracy: 0,
							}, // 4	"/",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
								accuracy: 0,
							}, // 5	"²",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
								accuracy: 0,
							}, // 6	"²√",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
								accuracy: 0,
							}, // 7	"³",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
								accuracy: 0,
							}, // 8	"³√",
							//TODO
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
								accuracy: 0,
							}, // 9	"!",
							// false, // 10  "log",
							// false, // 11  "cos",
						],

						statistics: {
							totalProblems: 0,
							totalCorrectProblems: 0,
							totalAccuracy: 0,
						},
					},

					settings: {
						// arcade
						warningExitMathArcade: true, // предупреждение перед выходом
						// match
						// TODO:
					},
				});
			}

			const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
			let dataAboutArcade = null;

			if (dataAboutUser.currentMatchId)
				dataAboutArcade =
					dataAboutUser.matchesData.mathArcade.history.find(
						(obj) => obj.matchId == dataAboutUser.currentMatchId
					);

			if (dataAboutUser) {
				if (
					dataAboutUser.userAction == "mathArcade1" &&
					/^-?\d+$/.test(text)
				) {
					dataAboutUser.matchesData.enteredResult = parseInt(text);
					mathArcade(chatId, 2);
				}

				if (
					dataAboutUser.userAction == "firstMeeting2" &&
					Array.from(text)[0] != "/"
				) {
					dataAboutUser.login = text;
					firstMeeting(chatId, 3);
				}

				if (
					dataAboutUser.userAction == "mathArcadeMenu1" &&
					text != chatId &&
					usersData.find((obj) => obj.chatId == text) &&
					!dataAboutUser.matchesData.mathArcade.invitedPlayers.find(
						(obj) => obj.chatId == text
					)
				) {
					let dataAboutCertainUser = usersData.find(
						(obj) => obj.chatId == text
					);

					if (!dataAboutUser.matchesData.mathArcade.invitedPlayers)
						dataAboutUser.matchesData.mathArcade.invitedPlayers =
							[];

					await dataAboutUser.matchesData.mathArcade.invitedPlayers.push(
						{
							chatId: dataAboutCertainUser.chatId,
							phoneNumber: dataAboutCertainUser.phoneNumber,
						}
					);

					console.log(22);

					mathArcadeMenu(chatId, 1);
				}

				if (text.includes("/start deleteInvitedPlayerWithId")) {
					match = text.match(
						/^\/start deleteInvitedPlayerWithId(.*)$/
					);

					if (
						dataAboutUser.matchesData.mathArcade.invitedPlayers.find(
							(obj) => obj.chatId == parseInt(match[1])
						)
					) {
						dataAboutUser.matchesData.mathArcade.invitedPlayers.splice(
							dataAboutUser.matchesData.mathArcade.invitedPlayers.indexOf(
								dataAboutUser.matchesData.mathArcade.invitedPlayers.find(
									(obj) => obj.chatId == parseInt(match[1])
								)
							)
						);

						mathArcadeMenu(chatId, 1);
					}

					mathArcade(chatId, parseInt(match[1]));
				}

				if (text.includes("/start mathArcade")) {
					match = text.match(/^\/start mathArcade(.*)$/);

					mathArcade(chatId, parseInt(match[1]));
				}

				if (
					text.includes("/start topicsListShow") ||
					text.includes("/start topicsListHide")
				) {
					match = text.match(/^\/start topicsList(.*)In(.*)$/);

					if (match[2] == "MathArcade0")
						mathArcade(chatId, 0, null, match[1] == "Show");
				}

				if (
					(dataAboutUser.matchesData.writeIntervalFrom ||
						dataAboutUser.matchesData.writeIntervalTo) &&
					/^-?\d+$/.test(text)
				) {
					if (dataAboutUser.matchesData.writeIntervalFrom) {
						if (parseInt(text) >= -10000 && parseInt(text) <= 10000)
							dataAboutUser.matchesData.intervalFrom =
								parseInt(text);
						else if (parseInt(text) > 10000)
							dataAboutUser.matchesData.intervalFrom = 10000;
						else if (parseInt(text) < -10000)
							dataAboutUser.matchesData.intervalFrom = -10000;

						dataAboutUser.matchesData.generatorLevel = 0;
						dataAboutUser.matchesData.writeIntervalFrom = false;

						//? ОПРЕДЕЛЕНИЕ ОШИБОК С ПРОМЕЖУТКАМИ
						if (
							dataAboutUser.matchesData.intervalFrom >=
							dataAboutUser.matchesData.intervalTo
						)
							dataAboutUser.matchesData.intervalFromError = true;
						else {
							dataAboutUser.matchesData.intervalFromError = false;
							dataAboutUser.matchesData.intervalToError = false;
						}
					} else if (dataAboutUser.matchesData.writeIntervalTo) {
						if (parseInt(text) <= 10000 && parseInt(text) >= -10000)
							dataAboutUser.matchesData.intervalTo =
								parseInt(text);
						else if (parseInt(text) > 10000)
							dataAboutUser.matchesData.intervalTo = 10000;
						else if (parseInt(text) < -10000)
							dataAboutUser.matchesData.intervalTo = -10000;

						dataAboutUser.matchesData.generatorLevel = 0;
						dataAboutUser.matchesData.writeIntervalTo = false;

						//? ОПРЕДЕЛЕНИЕ ОШИБОК С ПРОМЕЖУТКАМИ
						if (
							dataAboutUser.matchesData.intervalFrom >=
							dataAboutUser.matchesData.intervalTo
						)
							dataAboutUser.matchesData.intervalToError = true;
						else {
							dataAboutUser.matchesData.intervalFromError = false;
							dataAboutUser.matchesData.intervalToError = false;
						}
					}

					mathArcade(chatId, 0);
				}

				if (text.includes("/start setLevel")) {
					match = text.match(/^\/start setLevel(.*)In(.*)$/);

					let newGeneratorLevel;
					if (parseInt(match[1]) > 5) newGeneratorLevel = 1;
					else if (parseInt(match[1]) < 1) newGeneratorLevel = 5;
					else newGeneratorLevel = parseInt(match[1]);

					if (match[2] == "MathArcade1") {
						dataAboutArcade.settings.generatorLevel =
							newGeneratorLevel;

						dataAboutArcade.comboOfCorrect = 0;
						dataAboutArcade.comboOfIncorrect = 0;

						dataAboutUser.matchesData.mathArcade.previousMatchIsOverAlert = true;
						dataAboutUser.matchesData.mathArcade.newRecordAlert = false;

						dataAboutArcade.isOver = true;
						dataAboutUser.currentMatchId = null;

						mathArcade(chatId, 1);
					}
				}

				if (
					dataAboutUser.userAction == "editLogin" &&
					text != dataAboutUser.login &&
					Array.from(text)[0] != "/"
				) {
					dataAboutUser.supportiveCount = text;

					settings(chatId, true, true);
				}

				switch (text) {
					case "/restart":
					case "/start":
						try {
							bot.deleteMessage(chatId, dataAboutUser.messageId);
						} catch (error) {}

						await bot.sendMessage(chatId, "ㅤ").then((message) => {
							dataAboutUser.messageId = message.message_id;
						});

						if (text == "/restart") {
							menuHome(chatId);
						} else {
							firstMeeting(chatId, 1);
						}
						break;
					case "":
						break;
					case "/start editLogin":
						settings(chatId, true);
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "/start soon":
						bot.editMessageText(
							`<b>Помощник пока в раннем доступе.. 🫤</b>\n\n<i>Я ценю твоё сильное желание увидеть этот раздел!</i>\n\n<b>Но он еще просто не готов.. ☹️</b>`,
							{
								parse_mode: "html",
								chat_id: chatId,
								message_id: usersData.find(
									(obj) => obj.chatId == chatId
								).messageId,
								disable_web_page_preview: true,
								reply_markup: {
									inline_keyboard: [
										[
											{
												text: "⬅️В меню",
												callback_data: "exit",
											},
										],
									],
								},
							}
						);
						break;
				}
			}
			bot.deleteMessage(chatId, message.message_id);

			if (chatId != qu1z3xId && chatId != jackId) {
				sendDataAboutText(chatId, dataAboutUser.login, text);
			}
		} catch (error) {
			console.log(error);
			sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
		}
	});

	bot.on("callback_query", (query) => {
		const chatId = query.message.chat.id;
		const data = query.data;

		const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
		let dataAboutArcade = null;

		if (dataAboutUser.currentMatchId)
			dataAboutArcade = dataAboutUser.matchesData.mathArcade.history.find(
				(obj) => obj.matchId == dataAboutUser.currentMatchId
			);

		if (
			dataAboutUser &&
			query.message.message_id != dataAboutUser.messageIdOther
		) {
			dataAboutUser.messageId = query.message.message_id;
		}

		try {
			if (dataAboutUser) {
				if (data.includes("firstMeeting")) {
					match = data.match(/^firstMeeting(.*)$/);

					firstMeeting(chatId, parseInt(match[1]));
				}
				if (data.includes("AlertAbout")) {
					match = data.match(/^(.*)AlertAbout"(.*)"$/);

					let text;
					switch (match[2]) {
						case "accuracy":
							text = `${
								dataAboutArcade.accuracy
									? dataAboutArcade.accuracy
									: `0`
							}% 🎯 - твоя точность решения задачек в текущем матче!\n\n${
								dataAboutArcade.accuracy
									? `Решено: ${dataAboutArcade.countOfCorrect} из ${dataAboutArcade.countOfAllProblems}`
									: `Точность определится после правильно решенного примера`
							}`;
							break;
						case "":
							break;
						case "":
							break;
					}

					bot.answerCallbackQuery(query.id, {
						text: text,
						show_alert: match[1],
					});
				} else if (data.includes("toggleForTopicNum")) {
					match = data.match(/^toggleForTopicNum(.*)$/);

					dataAboutUser.schoolClassNum = 12;

					dataAboutUser.matchesData.topicsStatus[
						parseInt(match[1])
					].active =
						!dataAboutUser.matchesData.topicsStatus[
							parseInt(match[1])
						].active;

					topicsList(chatId);
				} else if (data.includes("setSchoolClassNum")) {
					match = data.match(/^setSchoolClassNum(.*)In(.*)$/);

					dataAboutUser.schoolClassNum = parseInt(match[1]);
					curriculumCreating(chatId);

					dataAboutUser.matchesData.writeIntervalFrom = false;
					dataAboutUser.matchesData.writeIntervalTo = false;

					if (match[2] == "FirstMeeting4") firstMeeting(chatId, 4);
					else if (match[2] == "MathArcade0") mathArcade(chatId, 0);
					else if (match[2] == "TopicsList") topicsList(chatId);
				} else if (data.includes("warningExitMathArcadeTo")) {
					match = data.match(/^warningExitMathArcadeTo"(.*)"$/);

					warningExitMathArcade(chatId, match[1]);
				} else if (data.includes("mathArcadeMenu")) {
					match = data.match(/^mathArcadeMenu(.*)$/);

					mathArcadeMenu(chatId, parseInt(match[1]));
				} else if (data.includes("nextMathProblemGeneration")) {
					match = data.match(/^nextMathProblemGeneration(.*)$/);

					if (match[1] == 1) {
						dataAboutArcade.comboOfCorrect = 0;
						++dataAboutArcade.comboOfIncorrect;
						++dataAboutArcade.countOfAllProblems;

						dataAboutUser.matchesData.mathArcade.newRecordAlert = false;
					}

					mathArcade(chatId, 1);
				} else if (data.includes("mathArcade")) {
					match = data.match(/^mathArcade(.*)$/);

					mathArcade(chatId, parseInt(match[1]));
				} else if (data.includes("setLevel")) {
					match = data.match(/^setLevel(.*)In(.*)$/);

					if (parseInt(match[1]) > 5)
						dataAboutUser.matchesData.generatorLevel = 1;
					else if (parseInt(match[1]) < 1)
						dataAboutUser.matchesData.generatorLevel = 5;
					else
						dataAboutUser.matchesData.generatorLevel = parseInt(
							match[1]
						);

					dataAboutUser.matchesData.writeIntervalFrom = false;
					dataAboutUser.matchesData.writeIntervalTo = false;

					if (match[2] == "MathArcade0") mathArcade(chatId, 0);
				} else if (data.includes("toggleWriteInterval")) {
					match = data.match(/^toggleWriteInterval(.*)$/);

					if (match[1] == "From") {
						dataAboutUser.matchesData.writeIntervalFrom =
							!dataAboutUser.matchesData.writeIntervalFrom;

						dataAboutUser.matchesData.writeIntervalTo = false;
					} else if (match[1] == "To") {
						dataAboutUser.matchesData.writeIntervalTo =
							!dataAboutUser.matchesData.writeIntervalTo;

						dataAboutUser.matchesData.writeIntervalFrom = false;
					}

					mathArcade(chatId, 0);
				}

				switch (data) {
					case "exit":
						menuHome(chatId);
						break;

					case "continueMathArcade":
						mathArcade(chatId, 1, false);
						break;
					case "topicsList":
						topicsList(chatId);
						break;
					case "deselectAllTopics":
						for (let i = 0; i < topics.length; i++)
							dataAboutUser.matchesData.topicsStatus[
								i
							].active = false;

						dataAboutUser.schoolClassNum = 12;

						topicsList(chatId);
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "arcadesHistory":
						historyList(chatId, null, 1, 1);
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "settings":
						settings(chatId);
						break;
					case "resetLogin":
						dataAboutUser.login = dataAboutUser.telegramFirstName;
						settings(chatId);
						break;
					case "editLogin":
						dataAboutUser.login = dataAboutUser.supportiveCount;

						bot.answerCallbackQuery(query.id, {
							text: `Твой логин изменен на «${dataAboutUser.supportiveCount}»! 😉`,
							show_alert: true,
						});

						settings(chatId);
						break;
					case "digfusionInfo":
						digfusionInfo(chatId);
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;
					case "soon":
						bot.editMessageText(
							`<b>Помощник пока в раннем доступе.. 🫤</b>\n\n<i>Я ценю твоё сильное желание увидеть этот раздел!</i>\n\n<b>Но он еще просто не готов.. ☹️</b>`,
							{
								parse_mode: "html",
								chat_id: chatId,
								message_id: usersData.find(
									(obj) => obj.chatId == chatId
								).messageId,
								disable_web_page_preview: true,
								reply_markup: {
									inline_keyboard: [
										[
											{
												text: "⬅️В меню",
												callback_data: "exit",
											},
										],
									],
								},
							}
						);
						break;
					case "":
						break;
				}
			} else {
				bot.editMessageText(
					`<b>Мы разве знакомы? 🤨\n</b>Мои системы тебя не помнят...<b> \n\n<i>Обычно такое бывает, когда происходят масштабные обновления! ☹️</i>\n\n</b>Раз уж так произошло, давай начнем все с <b>чистого листа!</b> Жми - <b>/restart</b> 😉`,
					{
						chat_id: chatId,
						message_id: query.message.message_id,
						parse_mode: "html",
						disable_web_page_preview: true,
					}
				);
			}

			if (chatId != qu1z3xId && chatId != jackId) {
				sendDataAboutButton(chatId, dataAboutUser.login, data);
			}
		} catch (error) {
			console.log(error);
			sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
		}
	});

	cron.schedule(`0 */2 * * *`, function () {
		// Запись данных в базу данных
		try {
			if (TOKEN == config.TOKENs[1]) {
				fs.writeFileSync(
					"DB.json",
					JSON.stringify({ usersData }, null, 2)
				);

				// if (new Date().getHours() % 12 == 0)
				// 	sendDataAboutDataBase(usersData);
			}
		} catch (error) {}
	});
}

StartAll();

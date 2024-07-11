import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import fs from "fs";

import { sendDataAboutButton } from "./tgterminal.js";
import { sendDataAboutError } from "./tgterminal.js";
import { sendDataAboutText } from "./tgterminal.js";

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

				await bot
					.sendMessage(chatId, "ㅤ")
					.then(
						(message) => (dataAboutUser.messageId = message.message_id)
					);

				await bot.editMessageText(
					`${textToSayHello}! Я <b>Алгебравичок! 👋\n\nМоя цель</b> - помогать тебе поддерживать свой <b>математический тонус,</b> генерируя и создавая для тебя различные <b>математические функции</b> и <b>примеры</b> разных сложностей. 😊`,
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
					`<b>Отлично!</b> Я чувствую <B>твой настрой!</B> 😃\n\nНо, для начала <B>познакомимся ближе,</B> напиши ниже <b>свое имя</b> ✍️`,
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
										text: `Оставить ${dataAboutUser.telegramFirstName} ✅`,
										callback_data: "firstMeeting3",
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
				// 	`<b>${dataAboutUser.login}, очень приятно! 🤗</b>\n\n<i>Требуестя для идентификации и парных дуэлей в режиме "Аркада" 🔒</i>\n\n<b>Оставь свой номер телефона, используя автозаполнение! 😉</b>`,
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
					`<b>Супер,</b> теперь я могу <b>тебе доверять!</b> 😍\n\n<b>Давай определимся с твоим арифметическим уровнем!</b>${
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
						message_id: usersData.find((obj) => obj.chatId == chatId)
							.messageId,
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
											dataAboutUser.schoolClassNum == 12 ? `-` : `-`,
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
										text:
											dataAboutUser.schoolClassNum &&
											!dataAboutUser.matchesData.topicsStatus.every(
												(obj) => !obj.active
											)
												? "Применить выбор ✅"
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
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

async function menuHome(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	const dateNowHHNN = new Date().getHours() * 100 + new Date().getMinutes();
	let dataAboutArcade = null;

	if (dateNowHHNN < 1200 && dateNowHHNN >= 600) textToSayHello = "Доброе утро";
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

			dataAboutUser.matchesData.mathArcade.history[
				dataAboutUser.matchesData.mathArcade.history.indexOf(
					dataAboutUser.matchesData.mathArcade.history.find(
						(obj) => obj.countOfAllProblems == 0
					)
				)
			] = [];

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
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
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
								text: "Учебник📖",
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
		sendDataAboutError(chatId, `${String(error)}`);
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
				!dataAboutUser.matchesData.topicsStatus.every((obj) => !obj.active)
					? `\n\n<b>Учебный класс: ${
							dataAboutUser.schoolClassNum == 12
								? `Свой ⚙️`
								: `${dataAboutUser.schoolClassNum}-й`
					  }</b>\n<blockquote><b>Выбранные темы:</b><i>${yourTopicsListText}</i></blockquote>`
					: `\n`
			}\n<b>Выбери нужные темы из списка ниже! 😉</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
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
									dataAboutUser.matchesData.topicsStatus[0].active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${0}`,
							},
							{
								text: `${topics[1].name} ${
									dataAboutUser.matchesData.topicsStatus[1].active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${1}`,
							},
						],
						[
							{
								text: `${topics[2].name} ${
									dataAboutUser.matchesData.topicsStatus[2].active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${2}`,
							},
							{
								text: `${topics[3].name} ${
									dataAboutUser.matchesData.topicsStatus[3].active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${3}`,
							},
						],
						[
							{
								text: `${topics[4].name} ${
									dataAboutUser.matchesData.topicsStatus[4].active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${4}`,
							},
							{
								text: `${topics[6].name} ${
									dataAboutUser.matchesData.topicsStatus[6].active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${6}`,
							},
						],
						[
							{
								text: `${topics[5].name} ${
									dataAboutUser.matchesData.topicsStatus[5].active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${5}`,
							},

							{
								text: `${topics[7].name} ${
									dataAboutUser.matchesData.topicsStatus[7].active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${7}`,
							},
						],
						[
							{
								text: `${topics[8].name} ${
									dataAboutUser.matchesData.topicsStatus[8].active
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${8}`,
							},
						],

						[
							{
								text:
									dataAboutUser.schoolClassNum == 12 ? `• ⚙️ •` : ``,
								callback_data:
									dataAboutUser.schoolClassNum == 12 ? `-` : `-`,
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
								text: dataAboutUser.matchesData.topicsStatus.every(
									(obj) => !obj.active
								)
									? "⛔️ Выбери нужные темы ⛔️"
									: !dataAboutUser.schoolClassNum
									? "⛔️ Выбери класс ⛔️"
									: "",
								callback_data: "-",
							},
						],
						[
							{
								text: "⬅️Назад",
								callback_data:
									dataAboutUser.userAction == "mathArcade0"
										? "mathArcade0"
										: dataAboutUser.userAction == "firstMeeting4"
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
										? ""
										: "🔄️",
								callback_data: "deselectAllTopics",
							},
							{
								text:
									dataAboutUser.matchesData.topicsStatus.every(
										(obj) => !obj.active
									) || !dataAboutUser.schoolClassNum
										? ""
										: "Принять ✅",
								callback_data:
									dataAboutUser.userAction == "mathArcade0"
										? "mathArcade0"
										: dataAboutUser.userAction == "firstMeeting4"
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
		sendDataAboutError(chatId, `${String(error)}`);
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
					else dataAboutUser.matchesData.topicsStatus[i].active = false;

				break;
			case 9:
				for (let i = 0; i < topics.length; i++)
					if (i <= 5)
						dataAboutUser.matchesData.topicsStatus[i].active = true;
					else dataAboutUser.matchesData.topicsStatus[i].active = false;

				break;
			case 10:
				for (let i = 0; i < topics.length; i++)
					if (i <= 10)
						dataAboutUser.matchesData.topicsStatus[i].active = true;
					else dataAboutUser.matchesData.topicsStatus[i].active = false;

				break;
			case 11:
				for (let i = 0; i < topics.length; i++)
					if (i <= 10)
						dataAboutUser.matchesData.topicsStatus[i].active = true;
					else dataAboutUser.matchesData.topicsStatus[i].active = false;

				//TODO: ТЕМЫ 11 КЛАССА
				break;
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

function calculate(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		switch (dataAboutUser.matchesData.topicNum) {
			case 1:
				return (
					dataAboutUser.matchesData.number1 +
					dataAboutUser.matchesData.number2
				);
			case 2:
				return (
					dataAboutUser.matchesData.number1 -
					dataAboutUser.matchesData.number2
				);
			case 3:
				return (
					dataAboutUser.matchesData.number1 *
					dataAboutUser.matchesData.number2
				);
			case 4:
				return (
					dataAboutUser.matchesData.number1 /
					dataAboutUser.matchesData.number2
				);
			case 5:
				return (
					dataAboutUser.matchesData.number1 *
					dataAboutUser.matchesData.number1
				);
			case 6:
				return Math.sqrt(dataAboutUser.matchesData.number1);
			case 7:
				return (
					dataAboutUser.matchesData.number1 *
					dataAboutUser.matchesData.number1 *
					dataAboutUser.matchesData.number1
				);
			case 8:
				return Math.cbrt(dataAboutUser.matchesData.number1);
			case 9:
				if (
					dataAboutUser.matchesData.number1 == 0 ||
					dataAboutUser.matchesData.number1 == 1
				) {
					return 1;
				} else {
					let result = 1;
					for (let i = 2; i <= dataAboutUser.matchesData.number1; i++)
						result *= i;

					return result;
				}
			case 10:
				break;
			case 11:
				break;
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

function adjustInterval(chatId, value) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		if (Math.abs(value) <= 50) {
			switch (dataAboutUser.matchesData.topicNum) {
				case 5:
					return value / 2;
				case 6:
					return Math.pow(value / 2, 2) * Math.sign(value);
				case 7:
					return (value / (value / 3)) * Math.sign(value);
				case 8:
					return Math.pow(value / 3, 3);
				case 9:
					return (value / (value / 4)) * Math.sign(value);
			}
		} else if (Math.abs(value) > 50 && Math.abs(value) <= 100) {
			switch (dataAboutUser.matchesData.topicNum) {
				case 5:
					return value / 3;
				case 6:
					return Math.pow(value / 3, 2) * Math.sign(value);
				case 7:
					return (value / (value / 6)) * Math.sign(value);
				case 8:
					return Math.pow(value / 6, 3);
				case 9:
					return (value / (value / 5)) * Math.sign(value);
			}
		} else if (Math.abs(value) > 100 && Math.abs(value) <= 200) {
			switch (dataAboutUser.matchesData.topicNum) {
				case 5:
					return value / 4;
				case 6:
					return Math.pow(value / 4, 2) * Math.sign(value);
				case 7:
					return (value / (value / 8)) * Math.sign(value);
				case 8:
					return Math.pow(value / 8, 3);
				case 9:
					return (value / (value / 6)) * Math.sign(value);
			}
		} else if (Math.abs(value) > 200 && Math.abs(value) <= 300) {
			switch (dataAboutUser.matchesData.topicNum) {
				case 5:
					return value / 5;
				case 6:
					return Math.pow(value / 5, 2) * Math.sign(value);
				case 7:
					return (value / (value / 10)) * Math.sign(value);
				case 8:
					return Math.pow(value / 10, 3);
				case 9:
					return (value / (value / 7)) * Math.sign(value);
			}
		} else if (Math.abs(value) > 300) {
			switch (dataAboutUser.matchesData.topicNum) {
				case 5:
					return value / 6;
				case 6:
					return Math.pow(value / 6, 2) * Math.sign(value);
				case 7:
					return (value / (value / 11)) * Math.sign(value);
				case 8:
					return Math.pow(value / 11, 3);
				case 9:
					return (value / (value / 7)) * Math.sign(value);
			}
		} else {
			return value;
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

async function numbersGenerator(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	let dataAboutArcade = null;

	if (dataAboutUser.currentMatchId)
		dataAboutArcade = dataAboutUser.matchesData.mathArcade.history.find(
			(obj) => obj.matchId == dataAboutUser.currentMatchId
		);
	try {
		let number1 = 0,
			number2 = 0;
		let intervalFrom = dataAboutArcade.settings.intervalFrom,
			intervalTo = dataAboutArcade.settings.intervalTo;

		switch (dataAboutUser.matchesData.topicNum) {
			case 1:
			case 2:
			case 3:
			case 4:
				// TODO: ограничение для умножения
				do {
					number1 =
						Math.floor(Math.random() * (intervalTo - intervalFrom + 1)) +
						intervalFrom;

					number2 =
						Math.floor(Math.random() * (intervalTo - intervalFrom + 1)) +
						intervalFrom;
				} while (
					// Условия для операции умножения
					(dataAboutUser.matchesData.topicNum == 3 &&
						Math.abs(number1) + Math.abs(number2) >=
							Math.abs(intervalTo) / 3 &&
						Math.abs(intervalTo) >= 100) ||
					(Math.abs(number1) + Math.abs(number2) >=
						Math.abs(intervalFrom) / 3 &&
						Math.abs(intervalFrom) >= 100) ||
					// Исключение значений 0, 1, -1
					number1 == 0 ||
					number1 == 1 ||
					number1 == -1 ||
					number2 == 0 ||
					number2 == 1 ||
					number2 == -1 ||
					// Условия для операции деления
					(dataAboutUser.matchesData.topicNum == 4 &&
						(number1 == 0 ||
							number1 == 1 ||
							number1 == -1 ||
							number2 == 0 ||
							number2 == 1 ||
							number2 == -1 ||
							number1 % number2 != 0))
				);
				break;
			case 5:
			case 6:
			case 7:
			case 8:
			case 9:
				intervalFrom = Math.floor(
					await adjustInterval(chatId, intervalFrom)
				);
				intervalTo = Math.floor(await adjustInterval(chatId, intervalTo));

				do {
					number1 =
						Math.floor(Math.random() * (intervalTo - intervalFrom + 1)) +
						intervalFrom;
				} while (
					dataAboutUser.matchesData.number1 == number1 ||
					((!Number.isInteger(Math.sqrt(number1)) ||
						number1 <= 0 ||
						number1 == 1) &&
						dataAboutUser.matchesData.topicNum == 6) ||
					((!Number.isInteger(Math.cbrt(number1)) ||
						number1 == 1 ||
						number1 == 0 ||
						number1 == -1) &&
						dataAboutUser.matchesData.topicNum == 8) ||
					(number1 <= 1 && dataAboutUser.matchesData.topicNum == 9) ||
					number1 == 0 ||
					number1 == 1 ||
					number1 == -1
				);
				break;
			case 10:
			case 11:
				break;
		}
		dataAboutUser.matchesData.number1 = number1;
		dataAboutUser.matchesData.number2 = number2;
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

async function mathProblemGenerator(chatId, certainTopicNum = null) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		if (certainTopicNum) dataAboutUser.matchesData.topicNum = certainTopicNum;
		else
			do {
				dataAboutUser.matchesData.topicNum =
					Math.floor(Math.random() * topics.length) + 1;
			} while (
				!dataAboutUser.matchesData.topicsStatus[
					dataAboutUser.matchesData.topicNum - 1
				].active
			);

		await numbersGenerator(chatId);
		dataAboutUser.matchesData.result = calculate(chatId);

		switch (dataAboutUser.matchesData.topicNum) {
			case 1:
				dataAboutUser.matchesData.mathProblemSentence =
					`${
						dataAboutUser.matchesData.number1 < 0
							? `(${dataAboutUser.matchesData.number1})`
							: dataAboutUser.matchesData.number1
					}` +
					` ${topics[dataAboutUser.matchesData.topicNum - 1].symbol} ` +
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
					` ${topics[dataAboutUser.matchesData.topicNum - 1].symbol} ` +
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
					` ${topics[dataAboutUser.matchesData.topicNum - 1].symbol} ` +
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
					` ${topics[dataAboutUser.matchesData.topicNum - 1].symbol} ` +
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
					}` + `${topics[dataAboutUser.matchesData.topicNum - 1].symbol}`;
				break;
			case 6:
				dataAboutUser.matchesData.mathProblemSentence =
					`${topics[dataAboutUser.matchesData.topicNum - 1].symbol}` +
					dataAboutUser.matchesData.number1;
				break;
			case 7:
				dataAboutUser.matchesData.mathProblemSentence =
					`${
						dataAboutUser.matchesData.number1 < 0
							? `(${dataAboutUser.matchesData.number1})`
							: dataAboutUser.matchesData.number1
					}` + `${topics[dataAboutUser.matchesData.topicNum - 1].symbol}`;
				break;
			case 8:
				dataAboutUser.matchesData.mathProblemSentence =
					`${topics[dataAboutUser.matchesData.topicNum - 1].symbol}` +
					dataAboutUser.matchesData.number1;
				break;
			case 9:
				dataAboutUser.matchesData.mathProblemSentence =
					dataAboutUser.matchesData.number1 +
					`${topics[dataAboutUser.matchesData.topicNum - 1].symbol}`;
				break;
			case 10:
				break;
			case 11:
				break;
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

async function mathArcade(
	chatId,
	numOfStage = 0,
	generateNew = true,
	topicsListActive = false
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
				for (let i = 0; i < topics.length; i++)
					if (dataAboutUser.matchesData.topicsStatus[i].active)
						yourTopicsListText += `\n- ${topics[i].name}`;

				await bot.editMessageText(
					`<b><i>🔥 Аркада • Параметры ⚙️</i></b>\n\nГенерация чисел: <b>${
						generatorLevel == 0
							? `Своя ⚙️`
							: `${generatorLevel >= 4 ? "🔥" : ""}${generatorLevel} ур `
					}</b>\nЧисла <b>от ${
						dataAboutUser.matchesData.intervalFrom
					} до ${dataAboutUser.matchesData.intervalTo}</b>${
						dataAboutUser.schoolClassNum &&
						!dataAboutUser.matchesData.topicsStatus.every(
							(obj) => !obj.active
						)
							? topicsListActive
								? `\n<blockquote><b>Включенные темы:</b><i>${yourTopicsListText}</i>\n<b><a href = "https://t.me/${BotName}/?start=topicsListHideInMathArcade0">Скрыть список</a></b></blockquote>`
								: `\n<blockquote><b>Включенные темы:</b><i>${truncateString(
										yourTopicsListText,
										22
								  )}</i>\n<b><a href = "https://t.me/${BotName}/?start=topicsListShowInMathArcade0">Раскрыть список</a></b></blockquote>`
							: ``
					}<b>${
						dataAboutUser.matchesData.intervalFromError ||
						dataAboutUser.matchesData.intervalToError
							? "\n\n❗Промежуток ОТ должен быть меньше и не равен промежутку ДО ⛔️"
							: !dataAboutUser.schoolClassNum
							? "\n\n❗Выбери свой класс ⛔️"
							: dataAboutUser.matchesData.topicsStatus.every(
									(obj) => !obj.active
							  )
							? "\n\n❗У тебя не выбраны темы ⛔️"
							: "\n\nЕсли требуется, измени параметры, и начинай считать! 😉"
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
														generatorLevel >= 4 ? "🔥" : ""
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
										text: dataAboutUser.matchesData.writeIntervalFrom
											? `от ... ❌`
											: `${
													dataAboutUser.matchesData
														.intervalFromError
														? "⛔️ "
														: ""
											  }от ${
													dataAboutUser.matchesData.intervalFrom
											  } ✏️`,
										callback_data: "toggleWriteIntervalFrom",
									},
									{
										text: dataAboutUser.matchesData.writeIntervalTo
											? `до ... ❌`
											: `${
													dataAboutUser.matchesData.intervalToError
														? "⛔️ "
														: ""
											  }до ${
													dataAboutUser.matchesData.intervalTo
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
											dataAboutUser.schoolClassNum == 12 ? `-` : `-`,
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
									{ text: "⬅️В меню", callback_data: "exit" },
									{
										text:
											dataAboutUser.matchesData.intervalFromError ||
											dataAboutUser.matchesData.intervalToError ||
											!dataAboutUser.schoolClassNum ||
											dataAboutUser.matchesData.topicsStatus.every(
												(obj) => !obj.active
											)
												? ""
												: "Поехали 🚀",
										callback_data: "mathArcade1",
									},
								],
							],
						},
					}
				);
				break;
			case 1:
				if (!dataAboutUser.currentMatchId) {
					do {
						rndId = Math.floor(Math.random() * 100000);
					} while (
						dataAboutUser.matchesData.mathArcade.history.some(
							(matchData) => matchData.matchId == rndId
						) &&
						dataAboutUser.matchesData.mathArcade.history.length != 0
					);

					console.log("Матч записан в массив");

					await dataAboutUser.matchesData.mathArcade.history.push({
						matchId: rndId,
						startTime: new Date(),
						allTime: 0,

						// СЧЕТЧИКИ
						comboOfCorrect: 0,
						comboOfIncorrect: 0,
						maxComboOfCorrect: 0,
						countOfCorrect: 0,
						countOfAllProblems: 0,

						// ИСТОРИЯ ПРИМЕРОВ В ЭТОМ МАТЧЕ
						mathProblemsHistory: [],

						// ПАРАМЕТРЫ ПРИ СОЗДАНИИ
						settings: {
							generatorLevel: dataAboutUser.matchesData.generatorLevel,
							intervalFrom: dataAboutUser.matchesData.intervalFrom,
							intervalTo: dataAboutUser.matchesData.intervalTo,

							topicsStatus: dataAboutUser.matchesData.topicsStatus,
						},

						// СТАТУСЫ
						recordInThisMatch: false,
						isOver: false,
					});

					dataAboutUser.currentMatchId = rndId;
				}

				if (dataAboutUser.currentMatchId)
					dataAboutArcade =
						dataAboutUser.matchesData.mathArcade.history.find(
							(obj) => obj.matchId == dataAboutUser.currentMatchId
						);

				generatorLevel = dataAboutArcade.settings.generatorLevel;

				// if (generatorLevel != 0) {
				// 	dataAboutArcade.settings.intervalFrom =
				// 		generatorLevel == 1
				// 			? -25
				// 			: generatorLevel == 2
				// 			? -50
				// 			: generatorLevel == 3
				// 			? -100
				// 			: generatorLevel == 4
				// 			? -200
				// 			: generatorLevel == 5
				// 			? -300
				// 			: null;
				// 	dataAboutArcade.settings.intervalTo =
				// 		generatorLevel == 1
				// 			? 25
				// 			: generatorLevel == 2
				// 			? 50
				// 			: generatorLevel == 3
				// 			? 100
				// 			: generatorLevel == 4
				// 			? 200
				// 			: generatorLevel == 5
				// 			? 300
				// 			: null;
				// }

				if (generateNew) await mathProblemGenerator(chatId);

				await bot.editMessageText(
					`<b><i>🔥 Аркада 🕹️</i></b>\n\nСложность: <b>${
						dataAboutArcade.settings.generatorLevel == 0
							? "Своя ⚙️"
							: `${dataAboutArcade.settings.generatorLevel}-я`
					}</b>\nЧисла <b>от ${dataAboutArcade.settings.intervalFrom} до ${
						dataAboutArcade.settings.intervalTo
					}${
						dataAboutUser.matchesData.mathArcade.maxComboOfCorrect != 0
							? dataAboutUser.matchesData.mathArcade.newRecordAlert
								? `\n\nНовый рекорд! 🎉`
								: `</b>\n\nЛучшее комбо: <b>${dataAboutUser.matchesData.mathArcade.maxComboOfCorrect}x 🏆`
							: dataAboutArcade.comboOfCorrect != 0 &&
							  dataAboutUser.matchesData.mathArcade.maxComboOfCorrect ==
									0
							? `\n`
							: ``
					}${
						dataAboutUser.matchesData.mathArcade.previousMatchIsOverAlert
							? `</b><i>\n\nЗавершенная аркада сохранена в "Истории", новый уровень: ${dataAboutArcade.settings.generatorLevel}-й</i><b>`
							: `${
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
										  }${
												dataAboutArcade.comboOfCorrect >= 5 &&
												dataAboutArcade.settings.generatorLevel !=
													5 &&
												dataAboutArcade.settings.generatorLevel != 0
													? `\n<a href="https://t.me/${BotName}/?start=setLevel${
															dataAboutArcade.settings
																.generatorLevel + 1
													  }InMathArcade1">Начать снова, но посложней</a>`
													: ``
										  }`
										: dataAboutArcade.comboOfIncorrect >= 3 &&
										  dataAboutArcade.settings.generatorLevel != 1 &&
										  dataAboutArcade.settings.generatorLevel != 0
										? `${
												dataAboutUser.matchesData.mathArcade
													.maxComboOfCorrect == 0
													? "\n"
													: ""
										  }\n<a href="https://t.me/${BotName}/?start=setLevel${
												dataAboutArcade.settings.generatorLevel - 1
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
						message_id: usersData.find((obj) => obj.chatId == chatId)
							.messageId,
						disable_web_page_preview: true,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "❌",
										callback_data: `warningExitMathArcadeTo"mathArcade3"`,
									},
									// {
									// 	text: "⚙️",
									// 	callback_data: `warningExitMathArcadeTo"mathArcade0"
									// 	`,
									// },
									{
										text: "➡️",
										callback_data: `${
											dataAboutArcade.comboOfCorrect != 0
												? `warningExitMathArcadeTo"nextMathProblemGeneration"`
												: "nextMathProblemGeneration"
										}`,
									},
								],
							],
						},
					}
				);

				dataAboutUser.matchesData.mathArcade.previousMatchIsOverAlert = false;
				break;
			case 2:
				if (dataAboutUser.currentMatchId)
					dataAboutArcade =
						dataAboutUser.matchesData.mathArcade.history.find(
							(obj) => obj.matchId == dataAboutUser.currentMatchId
						);

				if (
					dataAboutUser.matchesData.enteredResult ==
					dataAboutUser.matchesData.result
				) {
					rndNum = Math.floor(Math.random() * motivationPhrases.length);

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

				dataAboutUser.userAction = "mathArcade2";

				await bot.editMessageText(
					`<b><i>🔥 Аркада 🕹️</i></b>\n\nСложность: <b>${
						dataAboutArcade.settings.generatorLevel == 0
							? "Своя ⚙️"
							: `${dataAboutArcade.settings.generatorLevel}-я`
					}\n</b>Решено: <b>${dataAboutArcade.countOfCorrect} из ${
						dataAboutArcade.countOfAllProblems
					}${
						dataAboutUser.matchesData.mathArcade.maxComboOfCorrect != 0
							? dataAboutUser.matchesData.mathArcade.newRecordAlert
								? `\n\nНовый рекорд! 🎉`
								: `</b>\n\nЛучшее комбо: <b>${dataAboutUser.matchesData.mathArcade.maxComboOfCorrect}x 🏆`
							: dataAboutArcade.comboOfCorrect != 0
							? `\n`
							: ``
					}${
						dataAboutArcade.comboOfCorrect != 0
							? `\nПодряд ( ${dataAboutArcade.comboOfCorrect}x ) ${
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
						dataAboutArcade.settings.generatorLevel != 1 &&
						dataAboutArcade.settings.generatorLevel != 0
							? `${
									dataAboutUser.matchesData.mathArcade
										.maxComboOfCorrect == 0
										? "\n"
										: ""
							  }\n<a href="https://t.me/${BotName}/?start=setLevel${
									dataAboutArcade.settings.generatorLevel - 1
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
						message_id: usersData.find((obj) => obj.chatId == chatId)
							.messageId,
						disable_web_page_preview: true,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text:
											dataAboutUser.matchesData.enteredResult ==
											dataAboutUser.matchesData.result
												? motivationPhrases[rndNum]
												: "❌",
										callback_data: `${
											dataAboutUser.matchesData.enteredResult ==
											dataAboutUser.matchesData.result
												? "-"
												: `warningExitMathArcadeTo"mathArcade3"`
										}`,
									},
									// {
									// 	text:
									// 		dataAboutUser.matchesData.enteredResult ==
									// 		dataAboutUser.matchesData.result
									// 			? ""
									// 			: "⚙️",
									// 	callback_data: `${
									// 		dataAboutArcade.comboOfCorrect > 0
									// 			? `warningExitMathArcadeTo"mathArcade0"`
									// 			: `mathArcade0`
									// 	}`,
									// },
									{
										text:
											dataAboutUser.matchesData.enteredResult ==
											dataAboutUser.matchesData.result
												? ""
												: "➡️",
										callback_data:
											dataAboutArcade.comboOfCorrect != 0
												? `warningExitMathArcadeTo"nextMathProblemGeneration"`
												: `nextMathProblemGeneration`,
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

					dataAboutUser.matchesData.mathArcade.newRecordAlert = false;

					dataAboutArcade.isOver = true;
					dataAboutUser.currentMatchId = null;
				}

				let accuracy = Math.floor(
					(dataAboutArcade.countOfCorrect /
						dataAboutArcade.countOfAllProblems) *
						100
				);

				await bot.editMessageText(
					`<b><i>🔥 Аркада 🕹️</i></b>\n\nРезультат: <b>${
						dataAboutArcade.countOfCorrect
					} из ${dataAboutArcade.countOfAllProblems}</b>${
						dataAboutArcade.countOfAllProblems > 0
							? `\nТочность: <b>${accuracy}%</b>`
							: ``
					}\nВремя: <b>${`0:13`}${
						dataAboutUser.matchesData.mathArcade.maxComboOfCorrect != 0
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
													dataAboutUser.matchesData.mathArcade
														.maxComboOfCorrect %
														10 ==
													1
														? "пример"
														: `${
																dataAboutUser.matchesData
																	.mathArcade
																	.maxComboOfCorrect %
																	10 >=
																	2 &&
																dataAboutUser.matchesData
																	.mathArcade
																	.maxComboOfCorrect %
																	10 <=
																	4
																	? "примера"
																	: ``
														  }`
											  }`
								  } `
								: `</b>\n\nЛучшее комбо: <b>${dataAboutUser.matchesData.mathArcade.maxComboOfCorrect}x`
							: ``
					}\n\n</b><blockquote><i><b>Подробности аркады:</b></i>\nСложность: <b>${
						dataAboutArcade.settings.generatorLevel == 0
							? "Своя ⚙️"
							: `${dataAboutArcade.settings.generatorLevel}-я`
					}</b>\nЧисла <b>от ${dataAboutArcade.settings.intervalFrom} до ${
						dataAboutArcade.settings.intervalTo
					}</b></blockquote>\n<b>${
						accuracy >= 75
							? `Прекрасный результат, давай еще одну? 🤩`
							: accuracy >= 50 && accuracy < 75
							? `Неплохой результат, еще аркадку? 👍`
							: accuracy < 50
							? `Грустный результат, переиграем? 🫤`
							: ``
					} </b>`,
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
		sendDataAboutError(chatId, `${String(error)}`);
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
					? `\n\n<i>Твоя <b>серия из ${dataAboutArcade.comboOfCorrect} ${
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
													dataAboutArcade.comboOfCorrect % 10 >=
														2 &&
													dataAboutArcade.comboOfCorrect % 10 <= 4
														? "решенных примеров"
														: ``
											  }`
								  }`
					  }, будет прервана❗</b></i>`
					: ``
			}\n\nДействительно ли ты, <b>хочешь ${
				exitToWhere == "mathArcade3"
					? `завершить прохождение аркады`
					: exitToWhere == "nextMathProblemGeneration"
					? `перейти к следущему примеру`
					: ``
			}? 🤔</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
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
										: exitToWhere == "nextMathProblemGeneration"
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
		sendDataAboutError(chatId, `${String(error)}`);
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
		sendDataAboutError(chatId, `${String(error)}`);
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
				}\n\n<b>Статистика:</b>\n\n<i>Помощник в раннем доступе!</i> 🫤`,
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
									text: "Кто мы ❓",
									callback_data: "moreAboutUs",
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
										dataAboutUser.login !=
										dataAboutUser.telegramFirstName
											? "Сбросить❌"
											: ""
									}`,
									callback_data: "resetLogin",
								},
							],
							[
								{
									text: `⬅️Назад`,
									callback_data: "settings",
								},
								{
									text: `${afterEdit ? "Принять✅" : ""}`,
									callback_data: "editLogin",
								},
							],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

async function moreAboutUs(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		await bot.editMessageText(
			`<b><i>❓Кто мы такие❓</i></b>\n\nКомпания <b><i>digfusion</i></b> - <b>начинающий стартап,</b> разрабатывающий <b>свои приложения</b> и предоставляющий услуги по <b>созданию чат-ботов</b> различных типов!\n\n<b>Обращайтесь к нам,</b> и мы поможем вам создать <b><i>эффективного, шустрого</i> и приятного для использования</b> чат-бота для <b>любой</b> вашей <b>деятельности!</b> 😉\n\nПросмотреть все <b>наши проекты, реальные отзывы, каталог услуг</b> и <b>прочую информацию о компании</b> можно в нашем <b>боте-консультанте! 💁‍♂️</b> \n\n<b>• Единый бот компании: @digfusionbot</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "⬅️Назад", callback_data: "settings" },
							{
								text: "Поддержка 💭",
								url: "https://t.me/digfusionsupport",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

async function StartAll() {
	if (TOKEN == config.TOKENs[0]) {
		BotName = "digtestingbot";
	} else if (TOKEN == config.TOKENs[1]) {
		BotName = "digmathbot";
	}

	bot.on("contact", (message) => {
		const chatId = message.chat.id;
		const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

		if (dataAboutUser && dataAboutUser.userAction == "firstMeeting3") {
			dataAboutUser.phoneNumber = message.contact.phone_number;
			firstMeeting(chatId, 4);

			try {
				bot.deleteMessage(chatId, dataAboutUser.messageIdOther);
				bot.deleteMessage(chatId, message.message_id);
			} catch (error) {}
		}
	});

	bot.on("message", async (message) => {
		const chatId = message.chat.id;
		const text = message.text;

		try {
			if (!usersData.find((obj) => obj.chatId === chatId)) {
				usersData.push({
					chatId: chatId,
					login: message.from.first_name,
					telegramFirstName: message.from.first_name,
					phoneNumber: null,
					messageId: null,
					userAction: null,
					schoolClassNum: null,
					currentMatchId: null,

					messageIdOther: null,
					supportiveCount: null,

					matchesData: {
						mathProblemSentence: null,
						number1: null,
						number2: null,
						// number3: null,
						// number4: null,
						// number5: null,
						// number6: null,
						topicNum: null,
						result: null,
						enteredResult: null,

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

							history: [],
						},

						//TODO: ПЕРЕДАВИТЬ В ДАННЫЕ ОБ МАТЧЕ ТОЛЬКО ПАРАМЕТР ACTIVE
						topicsStatus: [
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
							}, // 1	"+",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
							}, // 2	"-",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
							}, // 3	"×",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
							}, // 4	"/",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
							}, // 5	"²",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
							}, // 6	"²√",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
							}, // 7	"³",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
							}, // 8	"³√",
							{
								active: false,
								countOfCorrect: 0,
								countOfAllProblems: 0,
							}, // 9	"!",
							// false, // 10  "log",
							// false, // 11  "cos",
						],

						statistics: {
							totalSolvedProblems: null,
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
				dataAboutArcade = dataAboutUser.matchesData.mathArcade.history.find(
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
						if (parseInt(text) >= -100000 && parseInt(text) <= 100000)
							dataAboutUser.matchesData.intervalFrom = parseInt(text);
						else if (parseInt(text) > 100000)
							dataAboutUser.matchesData.intervalFrom = 100000;
						else if (parseInt(text) < -100000)
							dataAboutUser.matchesData.intervalFrom = -100000;

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
						if (parseInt(text) <= 100000 && parseInt(text) >= -100000)
							dataAboutUser.matchesData.intervalTo = parseInt(text);
						else if (parseInt(text) > 100000)
							dataAboutUser.matchesData.intervalTo = 100000;
						else if (parseInt(text) < -100000)
							dataAboutUser.matchesData.intervalTo = -100000;

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

					if (parseInt(match[1]) > 5)
						dataAboutArcade.settings.generatorLevel = 1;
					else if (parseInt(match[1]) < 1)
						dataAboutArcade.settings.generatorLevel = 5;
					else
						dataAboutArcade.settings.generatorLevel = parseInt(match[1]);

					if (match[2] == "MathArcade1") {
						dataAboutArcade.comboOfCorrect = 0;
						dataAboutArcade.comboOfIncorrect = 0;

						if (dataAboutArcade) {
							dataAboutArcade.isOver = true;

							dataAboutUser.currentMatchId = null;
						}

						dataAboutUser.matchesData.mathArcade.previousMatchIsOverAlert = true;
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
					case "/start":
					case "/restart":
						firstMeeting(chatId);
						break;
					case "ые":
					case "Ые":
					case "st":
					case "St":
						// fs.writeFile(
						// 	"customData.json",
						// 	JSON.stringify({ usersData })
						// );

						if (
							fs.readFileSync("customData.json") != "[]" &&
							fs.readFileSync("customData.json") != ""
						) {
							let dataFromDB = JSON.parse(
								fs.readFileSync("customData.json")
							);
							usersData = dataFromDB.usersData || [];
						}

						if (chatId == qu1z3xId) {
							await bot
								.sendMessage(chatId, "ㅤ")
								.then(
									(message) =>
										(usersData.find(
											(obj) => obj.chatId == chatId
										).messageId = message.message_id)
								);

							menuHome(chatId);
						}
						break;

					case "":
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
					case "":
						break;
				}
			}
			bot.deleteMessage(chatId, message.message_id);

			if (chatId != qu1z3xId && chatId != jackId) {
				sendDataAboutText(
					dataAboutUser.login,
					message.from.username,
					chatId,
					text
				);
			}
		} catch (error) {
			console.log(error);
			sendDataAboutError(chatId, `${String(error)}`);
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

		if (!dataAboutUser.messageId) {
			dataAboutUser.messageId = query.message.message_id;
		}

		try {
			if (dataAboutUser) {
				if (data.includes("firstMeeting")) {
					match = data.match(/^firstMeeting(\d+)$/);

					firstMeeting(chatId, parseInt(match[1]));
				} else if (data.includes("toggleForTopicNum")) {
					match = data.match(/^toggleForTopicNum(.*)$/);

					dataAboutUser.schoolClassNum = 12;

					dataAboutUser.matchesData.topicsStatus[
						parseInt(match[1])
					].active =
						!dataAboutUser.matchesData.topicsStatus[parseInt(match[1])]
							.active;

					topicsList(chatId);
				} else if (data.includes("setSchoolClassNum")) {
					match = data.match(/^setSchoolClassNum(\d+)In(.*)$/);

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
				} else if (data.includes("mathArcade")) {
					match = data.match(/^mathArcade(\d+)$/);

					mathArcade(chatId, parseInt(match[1]));
				} else if (data.includes("setLevel")) {
					match = data.match(/^setLevel(.*)In(.*)$/);

					if (parseInt(match[1]) > 5)
						dataAboutUser.matchesData.generatorLevel = 1;
					else if (parseInt(match[1]) < 1)
						dataAboutUser.matchesData.generatorLevel = 5;
					else
						dataAboutUser.matchesData.generatorLevel = parseInt(match[1]);

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
					case "nextMathProblemGeneration":
						dataAboutArcade.comboOfCorrect = 0;

						mathArcade(chatId, 1);
						break;
					case "continueMathArcade":
						mathArcade(chatId, 1, false);
						break;
					case "topicsList":
						topicsList(chatId);
						break;
					case "deselectAllTopics":
						for (let i = 0; i < topics.length; i++)
							dataAboutUser.matchesData.topicsStatus[i].active = false;

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
						settings(chatId, true, false);
						break;
					case "editLogin":
						dataAboutUser.login = dataAboutUser.supportiveCount;
						settings(chatId);
						break;
					case "moreAboutUs":
						moreAboutUs(chatId);
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
										[{ text: "⬅️В меню", callback_data: "exit" }],
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
				sendDataAboutButton(
					dataAboutUser.login,
					query.from.username,
					chatId,
					data
				);
			}
		} catch (error) {
			console.log(error);
			sendDataAboutError(chatId, `${String(error)}`);
		}
	});
}

StartAll();

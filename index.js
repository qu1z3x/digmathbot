import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import fs from "fs";

import { sendDataAboutButton } from "./tgterminal.js";
import { sendDataAboutError } from "./tgterminal.js";
import { sendDataAboutText } from "./tgterminal.js";

const TOKENs = [
	"7072188605:AAGRJq0QEasOS3CYVBnjBZdnIzpRDRWoYpI",
	"7065552948:AAGJUvNrQVU_sBHK4UrTrFz5Dpy4fccdycQ",
];

const TOKEN = TOKENs[1]; // 1 - оригинал
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
				await bot.editMessageText(
					`<b>${dataAboutUser.login}, очень приятно! 🤗</b>\n\n<i>Требуестя для идентификации и парных дуэлей в режиме "Аркада" 🔒</i>\n\n<b>Оставь свой номер телефона, используя автозаполнение! 😉</b>`,
					{
						parse_mode: "html",
						chat_id: chatId,
						message_id: usersData.find((obj) => obj.chatId == chatId)
							.messageId,
						disable_web_page_preview: true,
					}
				);

				await bot
					.sendMessage(
						chatId,
						`Нажми на кнопку <b>"Автозаполнить номер" ⬇️</b>`,
						{
							parse_mode: "HTML",
							disable_web_page_preview: true,
							reply_markup: {
								keyboard: [
									[
										{
											text: "Автозаполнить номер",
											request_contact: true,
										},
									],
								],
							},
						}
					)
					.then((message) => {
						dataAboutUser.messageIdOther = message.message_id;
					});
				break;

			case 4:
				let yourTopicsListText = "";
				for (let i = 0; i < topics.length; i++)
					if (dataAboutUser.arcadeData.topicsStatus[i])
						yourTopicsListText += `\n- ${topics[i].name}`;

				await bot.editMessageText(
					`<b>Супер,</b> теперь я могу <b>тебе доверять!</b> 😍\n\n<b>Давай определимся с твоим арифметическим уровнем!</b>${
						dataAboutUser.schoolClassNum &&
						!dataAboutUser.arcadeData.topicsStatus.every((obj) => !obj)
							? `\n\n<b>Темы ${
									dataAboutUser.schoolClassNum == 12
										? `выбранные тобой:`
										: `${dataAboutUser.schoolClassNum}-го класса:`
							  }</b><i>${yourTopicsListText}</i>`
							: ``
					}\n\n<i>(Изменяется в настроках)</i>\n\n<b>Выбери свой класс в школе:</b>`,
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
											!dataAboutUser.arcadeData.topicsStatus.every(
												(obj) => !obj
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

	if (dateNowHHNN < 1200 && dateNowHHNN >= 600) textToSayHello = "Доброе утро";
	else if (dateNowHHNN < 1700 && dateNowHHNN >= 1200)
		textToSayHello = "Добрый день";
	else if (dateNowHHNN < 2200 && dateNowHHNN >= 1700)
		textToSayHello = "Добрый вечер";
	else if (dateNowHHNN >= 2200 || dateNowHHNN < 600)
		textToSayHello = "Доброй ночи";

	try {
		dataAboutUser.userAction = "menuHome";

		dataAboutUser.arcadeData.writeIntervalFrom = false;
		dataAboutUser.arcadeData.writeIntervalTo = false;

		dataAboutUser.countOfCorrect = 0;
		dataAboutUser.countOfAllProblems = 0;

		dataAboutUser.comboOfCorrect = 0;

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
								text: "🔥 Аркада 🕐",
								callback_data: "mathArcade0",
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

async function topicsList(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		let yourTopicsListText = "";
		for (let i = 0; i < topics.length; i++)
			if (dataAboutUser.arcadeData.topicsStatus[i])
				yourTopicsListText += `\n- ${topics[i].name}`;

		await bot.editMessageText(
			`<b><i>📚 Выбор определнных тем ✏️</i></b>${
				dataAboutUser.schoolClassNum &&
				!dataAboutUser.arcadeData.topicsStatus.every((obj) => !obj)
					? `<b>\n\nТемы ${
							dataAboutUser.schoolClassNum == 12
								? `выбранные тобой:`
								: `${dataAboutUser.schoolClassNum}-го класса:`
					  }</b><i>${yourTopicsListText}</i>`
					: ``
			}\n\n<b>Выбери нужные темы из списка ниже! 😉</b>`,
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
									dataAboutUser.arcadeData.topicsStatus[0]
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${0}`,
							},
							{
								text: `${topics[1].name} ${
									dataAboutUser.arcadeData.topicsStatus[1]
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${1}`,
							},
						],
						[
							{
								text: `${topics[2].name} ${
									dataAboutUser.arcadeData.topicsStatus[2]
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${2}`,
							},
							{
								text: `${topics[3].name} ${
									dataAboutUser.arcadeData.topicsStatus[3]
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${3}`,
							},
						],
						[
							{
								text: `${topics[4].name} ${
									dataAboutUser.arcadeData.topicsStatus[4]
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${4}`,
							},
							{
								text: `${topics[6].name} ${
									dataAboutUser.arcadeData.topicsStatus[6]
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${6}`,
							},
						],
						[
							{
								text: `${topics[5].name} ${
									dataAboutUser.arcadeData.topicsStatus[5]
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${5}`,
							},

							{
								text: `${topics[7].name} ${
									dataAboutUser.arcadeData.topicsStatus[7]
										? "✅"
										: "➕"
								}`,
								callback_data: `toggleForTopicNum${7}`,
							},
						],
						[
							{
								text: `${topics[8].name} ${
									dataAboutUser.arcadeData.topicsStatus[8]
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
								text: dataAboutUser.arcadeData.topicsStatus.every(
									(obj) => !obj
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
									dataAboutUser.arcadeData.topicsStatus.every(
										(obj) => !obj
									) || !dataAboutUser.schoolClassNum
										? ""
										: "🔄️",
								callback_data: "deselectAllTopics",
							},
							{
								text:
									dataAboutUser.arcadeData.topicsStatus.every(
										(obj) => !obj
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
					if (i <= 3) dataAboutUser.arcadeData.topicsStatus[i] = true;
					else dataAboutUser.arcadeData.topicsStatus[i] = false;

				break;
			case 9:
				for (let i = 0; i < topics.length; i++)
					if (i <= 5) dataAboutUser.arcadeData.topicsStatus[i] = true;
					else dataAboutUser.arcadeData.topicsStatus[i] = false;

				break;
			case 10:
				for (let i = 0; i < topics.length; i++)
					if (i <= 10) dataAboutUser.arcadeData.topicsStatus[i] = true;
					else dataAboutUser.arcadeData.topicsStatus[i] = false;

				break;
			case 11:
				for (let i = 0; i < topics.length; i++)
					if (i <= 10) dataAboutUser.arcadeData.topicsStatus[i] = true;
					else dataAboutUser.arcadeData.topicsStatus[i] = false;

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
		switch (dataAboutUser.topicNum) {
			case 1:
				return dataAboutUser.number1 + dataAboutUser.number2;
			case 2:
				return dataAboutUser.number1 - dataAboutUser.number2;
			case 3:
				return dataAboutUser.number1 * dataAboutUser.number2;
			case 4:
				return dataAboutUser.number1 / dataAboutUser.number2;
			case 5:
				return dataAboutUser.number1 * dataAboutUser.number1;
			case 6:
				return Math.sqrt(dataAboutUser.number1);
			case 7:
				return (
					dataAboutUser.number1 *
					dataAboutUser.number1 *
					dataAboutUser.number1
				);
			case 8:
				return Math.cbrt(dataAboutUser.number1);
			case 9:
				if (dataAboutUser.number1 == 0 || dataAboutUser.number1 == 1) {
					return 1;
				} else {
					let result = 1;
					for (let i = 2; i <= dataAboutUser.number1; i++) result *= i;

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

async function numbersGenerator(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		switch (dataAboutUser.topicNum) {
			case 1:
			case 2:
			case 3:
			case 4:
				do {
					dataAboutUser.number1 =
						Math.floor(
							Math.random() *
								(dataAboutUser.arcadeData.intervalTo -
									dataAboutUser.arcadeData.intervalFrom +
									1)
						) + dataAboutUser.arcadeData.intervalFrom;

					dataAboutUser.number2 =
						Math.floor(
							Math.random() *
								(dataAboutUser.arcadeData.intervalTo -
									dataAboutUser.arcadeData.intervalFrom +
									1)
						) + dataAboutUser.arcadeData.intervalFrom;
				} while (
					((dataAboutUser.number1 + dataAboutUser.number2 >=
						dataAboutUser.arcadeData.intervalTo / 3 ||
						dataAboutUser.number1 + dataAboutUser.number2 <
							dataAboutUser.arcadeData.intervalFrom / 3) &&
						dataAboutUser.topicNum == 3) ||
					((dataAboutUser.number1 == dataAboutUser.number2 ||
						dataAboutUser.number1 % dataAboutUser.number2 != 0 ||
						dataAboutUser.number1 / dataAboutUser.number2 == 0) &&
						dataAboutUser.topicNum == 4)
				);
				break;
			case 5:
			case 6:
			case 7:
			case 8:
			case 9:
				do {
					dataAboutUser.number1 =
						Math.floor(
							Math.random() *
								(dataAboutUser.arcadeData.intervalTo -
									dataAboutUser.arcadeData.intervalFrom +
									1)
						) + dataAboutUser.arcadeData.intervalFrom;
				} while (
					((dataAboutUser.number1 >
						dataAboutUser.arcadeData.intervalTo / 2 ||
						dataAboutUser.number1 <
							dataAboutUser.arcadeData.intervalFrom / 2) &&
						dataAboutUser.topicNum == 5) ||
					((!Number.isInteger(Math.sqrt(dataAboutUser.number1)) ||
						dataAboutUser.number1 <= 0 ||
						dataAboutUser.number1 == 1) &&
						dataAboutUser.topicNum == 6) ||
					((dataAboutUser.number1 >
						dataAboutUser.arcadeData.intervalTo / 3 ||
						dataAboutUser.number1 <
							dataAboutUser.arcadeData.intervalFrom / 3) &&
						dataAboutUser.topicNum == 7) ||
					((!Number.isInteger(Math.cbrt(dataAboutUser.number1)) ||
						dataAboutUser.number1 == 1 ||
						dataAboutUser.number1 == 0 ||
						dataAboutUser.number1 == -1) &&
						dataAboutUser.topicNum == 8) ||
					((dataAboutUser.number1 == 0 || dataAboutUser.number1 == 1) &&
						dataAboutUser.topicNum == 9)
				);
				break;
			case 10:
			case 11:
				break;
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

async function mathProblemGenerator(chatId, certainTopicNum = null) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		if (certainTopicNum) dataAboutUser.topicNum = certainTopicNum;
		else
			do {
				dataAboutUser.topicNum =
					Math.floor(Math.random() * topics.length) + 1;
			} while (
				!dataAboutUser.arcadeData.topicsStatus[dataAboutUser.topicNum - 1]
			);

		await numbersGenerator(chatId);
		dataAboutUser.result = calculate(chatId);

		switch (dataAboutUser.topicNum) {
			case 1:
				dataAboutUser.mathProblemSentence =
					`${
						dataAboutUser.number1 < 0
							? `(${dataAboutUser.number1})`
							: dataAboutUser.number1
					}` +
					` ${topics[dataAboutUser.topicNum - 1].symbol} ` +
					`${
						dataAboutUser.number2 < 0
							? `(${dataAboutUser.number2})`
							: dataAboutUser.number2
					}`;
				break;
			case 2:
				dataAboutUser.mathProblemSentence =
					`${
						dataAboutUser.number1 < 0
							? `(${dataAboutUser.number1})`
							: dataAboutUser.number1
					}` +
					` ${topics[dataAboutUser.topicNum - 1].symbol} ` +
					`${
						dataAboutUser.number2 < 0
							? `(${dataAboutUser.number2})`
							: dataAboutUser.number2
					}`;
				break;
			case 3:
				dataAboutUser.mathProblemSentence =
					`${
						dataAboutUser.number1 < 0
							? `(${dataAboutUser.number1})`
							: dataAboutUser.number1
					}` +
					` ${topics[dataAboutUser.topicNum - 1].symbol} ` +
					`${
						dataAboutUser.number2 < 0
							? `(${dataAboutUser.number2})`
							: dataAboutUser.number2
					}`;
				break;
			case 4:
				dataAboutUser.mathProblemSentence =
					`${
						dataAboutUser.number1 < 0
							? `(${dataAboutUser.number1})`
							: dataAboutUser.number1
					}` +
					` ${topics[dataAboutUser.topicNum - 1].symbol} ` +
					`${
						dataAboutUser.number2 < 0
							? `(${dataAboutUser.number2})`
							: dataAboutUser.number2
					}`;
				break;
			case 5:
				dataAboutUser.mathProblemSentence =
					`${
						dataAboutUser.number1 < 0
							? `(${dataAboutUser.number1})`
							: dataAboutUser.number1
					}` + `${topics[dataAboutUser.topicNum - 1].symbol}`;
				break;
			case 6:
				dataAboutUser.mathProblemSentence =
					`${topics[dataAboutUser.topicNum - 1].symbol}` +
					dataAboutUser.number1;
				break;
			case 7:
				dataAboutUser.mathProblemSentence =
					`${
						dataAboutUser.number1 < 0
							? `(${dataAboutUser.number1})`
							: dataAboutUser.number1
					}` + `${topics[dataAboutUser.topicNum - 1].symbol}`;
				break;
			case 8:
				dataAboutUser.mathProblemSentence =
					`${topics[dataAboutUser.topicNum - 1].symbol}` +
					dataAboutUser.number1;
				break;
			case 9:
				dataAboutUser.mathProblemSentence =
					dataAboutUser.number1 +
					`${topics[dataAboutUser.topicNum - 1].symbol}`;
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

async function mathArcade(chatId, numOfStage = 0, generateNew = true) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	await curriculumCreating(chatId);

	try {
		dataAboutUser.userAction = `mathArcade${numOfStage}`;

		switch (numOfStage) {
			case 0:
				let generatorLevel = dataAboutUser.arcadeData.generatorLevel;

				if (generatorLevel != 0) {
					dataAboutUser.arcadeData.intervalFrom =
						generatorLevel == 1
							? 0
							: generatorLevel == 2
							? -50
							: generatorLevel == 3
							? -100
							: generatorLevel == 4
							? -200
							: generatorLevel == 5
							? -300
							: null;
					dataAboutUser.arcadeData.intervalTo =
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

				dataAboutUser.countOfCorrect = 0;
				dataAboutUser.countOfAllProblems = 0;

				let yourTopicsListText = "";
				for (let i = 0; i < topics.length; i++)
					if (dataAboutUser.arcadeData.topicsStatus[i])
						yourTopicsListText += `\n- ${topics[i].name}`;

				await bot.editMessageText(
					`<b><i>🔥 Аркада • Параметры ⚙️</i></b>\n\nГенерация чисел: <b>${
						generatorLevel == 0
							? `Своя ⚙️`
							: `${generatorLevel >= 4 ? "🔥" : ""}${generatorLevel} ур `
					}</b>\nЧисла <b>от ${dataAboutUser.arcadeData.intervalFrom} до ${
						dataAboutUser.arcadeData.intervalTo
					}${
						dataAboutUser.arcadeData.intervalFromError ||
						dataAboutUser.arcadeData.intervalToError
							? "\n\n❗Промежуток ОТ должен быть меньше и не равен промежутку ДО ⛔️"
							: !dataAboutUser.schoolClassNum
							? "\n\n❗Выбери свой класс ⛔️"
							: dataAboutUser.arcadeData.topicsStatus.every(
									(obj) => !obj
							  )
							? "\n\n❗У тебя не выбраны темы ⛔️"
							: ""
					}</b>${
						dataAboutUser.schoolClassNum &&
						!dataAboutUser.arcadeData.topicsStatus.every((obj) => !obj)
							? `\n\n<b>Включенные темы:</b><i>${yourTopicsListText}</i>\n<b>Темы ${
									dataAboutUser.schoolClassNum == 12
										? `выбранные тобой`
										: `${dataAboutUser.schoolClassNum}-го класса`
							  }</b>`
							: ``
					}\n\n<b>Если требуется, измени параметры, и начинай считать! 😉</b>`,
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
										text: `Промежуток генерации чисел`,
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
										text: dataAboutUser.arcadeData.writeIntervalFrom
											? `от ... ❌`
											: `${
													dataAboutUser.arcadeData
														.intervalFromError
														? "⛔️ "
														: ""
											  }от ${
													dataAboutUser.arcadeData.intervalFrom
											  } ✏️`,
										callback_data: "toggleWriteIntervalFrom",
									},
									{
										text: dataAboutUser.arcadeData.writeIntervalTo
											? `до ... ❌`
											: `${
													dataAboutUser.arcadeData.intervalToError
														? "⛔️ "
														: ""
											  }до ${
													dataAboutUser.arcadeData.intervalTo
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
									{
										text:
											dataAboutUser.arcadeData.intervalFromError ||
											dataAboutUser.arcadeData.intervalToError
												? "⛔️ Измени промежуток ⛔️"
												: !dataAboutUser.schoolClassNum
												? "⛔️ Выбери класс ⛔️"
												: dataAboutUser.arcadeData.topicsStatus.every(
														(obj) => !obj
												  )
												? "⛔️ Выбери нужные темы ⛔️"
												: "",
										callback_data: "-",
									},
								],
								[
									{ text: "⬅️В меню", callback_data: "exit" },
									{
										text:
											dataAboutUser.arcadeData.intervalFromError ||
											dataAboutUser.arcadeData.intervalToError ||
											!dataAboutUser.schoolClassNum ||
											dataAboutUser.arcadeData.topicsStatus.every(
												(obj) => !obj
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
				if (generateNew) await mathProblemGenerator(chatId);

				await bot.editMessageText(
					`<b><i>🔥 Аркада 🕐</i></b>\n\nСложность: <b>${
						dataAboutUser.arcadeData.generatorLevel == 0
							? "Своя ⚙️"
							: `${dataAboutUser.arcadeData.generatorLevel}-я`
					}</b>\nЧисла <b>от ${dataAboutUser.arcadeData.intervalFrom} до ${
						dataAboutUser.arcadeData.intervalTo
					}${
						dataAboutUser.comboOfCorrect != 0
							? `\n\nКомбо ( ${dataAboutUser.comboOfCorrect}x ) ${
									dataAboutUser.comboOfCorrect >= 15
										? "🔥"
										: dataAboutUser.comboOfCorrect >= 10
										? "🤯"
										: dataAboutUser.comboOfCorrect >= 5
										? "😮"
										: ""
							  }${
									dataAboutUser.comboOfCorrect >= 5 &&
									dataAboutUser.arcadeData.generatorLevel != 5 &&
									dataAboutUser.arcadeData.generatorLevel != 0
										? `\n<a href="https://t.me/${BotName}/?start=setLevel${
												dataAboutUser.arcadeData.generatorLevel + 1
										  }InMathArcade1">Начать снова, но посложней</a>`
										: ``
							  }`
							: ``
					}\n\nРеши пример:<blockquote>${
						dataAboutUser.mathProblemSentence
					} = ...  <a href="1">💡</a></blockquote></b><i>Тема: <b>"${
						topics[dataAboutUser.topicNum - 1].name
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
										callback_data: `${
											dataAboutUser.comboOfCorrect != 0
												? `warningExitMathArcadeTo"exit"`
												: `exit`
										}`,
									},
									{
										text: "⚙️",
										callback_data: `${
											dataAboutUser.comboOfCorrect != 0
												? `warningExitMathArcadeTo"mathArcade0"`
												: `mathArcade0`
										}`,
									},
									{
										text: "➡️",
										callback_data: `${
											dataAboutUser.comboOfCorrect != 0
												? `warningExitMathArcadeTo"nextMathProblemGeneration"`
												: "nextMathProblemGeneration"
										}`,
									},
								],
							],
						},
					}
				);
				break;
			case 2:
				if (dataAboutUser.enteredResult == dataAboutUser.result) {
					rndNum = Math.floor(Math.random() * topics.length);

					dataAboutUser.comboOfCorrect++;
					setTimeout(() => {
						if (dataAboutUser.userAction != "menuHome") {
							mathArcade(chatId, 1);
						}
					}, 2500);
				} else {
					dataAboutUser.comboOfCorrect = 0;
				}

				dataAboutUser.userAction = "mathArcade2";

				await bot.editMessageText(
					`<b><i>🔥 Аркада 🕐</i></b>\n\nСложность: <b>${
						dataAboutUser.arcadeData.generatorLevel == 0
							? "Своя ⚙️"
							: `${dataAboutUser.arcadeData.generatorLevel}-я`
					}\n</b>Решено: <b>${dataAboutUser.countOfCorrect} из ${
						dataAboutUser.countOfAllProblems
					}${
						dataAboutUser.comboOfCorrect != 0
							? `\n\nПодряд ( ${dataAboutUser.comboOfCorrect}x ) ${
									dataAboutUser.comboOfCorrect >= 15
										? "🔥"
										: dataAboutUser.comboOfCorrect >= 10
										? "🤯"
										: dataAboutUser.comboOfCorrect >= 5
										? "😮"
										: ""
							  }`
							: ``
					}\n\nРешение:<blockquote>${dataAboutUser.mathProblemSentence} ${
						dataAboutUser.enteredResult == dataAboutUser.result
							? "="
							: `≠`
					} ${dataAboutUser.enteredResult} ${
						dataAboutUser.enteredResult == dataAboutUser.result
							? `✅ Верно`
							: `❌ Неверно\nОтвет: ${dataAboutUser.result}`
					}</blockquote></b><i>Тема: <b>"${
						topics[dataAboutUser.topicNum - 1].name
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
											dataAboutUser.enteredResult ==
											dataAboutUser.result
												? motivationPhrases[rndNum]
												: "❌",
										callback_data: `${
											dataAboutUser.enteredResult ==
											dataAboutUser.result
												? "-"
												: dataAboutUser.comboOfCorrect != 0
												? `warningExitMathArcadeTo"exit"`
												: `exit`
										}`,
									},
									{
										text:
											dataAboutUser.enteredResult ==
											dataAboutUser.result
												? ""
												: "⚙️",
										callback_data: `${
											dataAboutUser.comboOfCorrect != 0
												? `warningExitMathArcadeTo"mathArcade0"`
												: `mathArcade0`
										}`,
									},
									{
										text:
											dataAboutUser.enteredResult ==
											dataAboutUser.result
												? ""
												: "➡️",
										callback_data: `${
											dataAboutUser.comboOfCorrect != 0
												? `warningExitMathArcadeTo"nextMathProblemGeneration"`
												: "nextMathProblemGeneration"
										}`,
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

	try {
		await bot.editMessageText(
			`<b>${
				dataAboutUser.login
			}, ты прекрасно идешь! 👍</b>\n\n<i>Действительно ли ты, хочешь прервать свою <b>серию из ${
				dataAboutUser.comboOfCorrect
			} ${
				(dataAboutUser.comboOfCorrect >= 5 &&
					dataAboutUser.comboOfCorrect <= 20) ||
				(dataAboutUser.comboOfCorrect % 10 >= 5 &&
					dataAboutUser.comboOfCorrect % 10 <= 9) ||
				dataAboutUser.comboOfCorrect % 10 == 0
					? "решенных примеров"
					: `${
							dataAboutUser.comboOfCorrect % 10 == 1
								? "решенного примера"
								: `${
										dataAboutUser.comboOfCorrect % 10 >= 2 &&
										dataAboutUser.comboOfCorrect % 10 <= 4
											? "решенных примеров"
											: ``
								  }`
					  }`
			}?</b> 🤔</i>`,
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
								text: "Прервать ❌",
								callback_data: exitToWhere,
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

async function settings(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	try {
		await bot.editMessageText(
			`<b><i>👤 Профиль • <code>${
				dataAboutUser.chatId
			}</code> ⚙️</i>\n\nДанные:\n</b>Логин: <b>${
				dataAboutUser.login
			}</b> - <a href="https://t.me/${BotName}/?start=editLogin">изменить</a>${
				dataAboutUser.phoneNumber
					? `\nТелефон: <b>${dataAboutUser.phoneNumber}</b>`
					: ``
			}\n\n<i>Помощник в раннем доступе!</i> 🫤`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
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
	}
}

async function StartAll() {
	if (TOKEN == TOKENs[0]) {
		BotName = "digtestingbot";
	} else if (TOKEN == TOKENs[1]) {
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

					arcadeData: {
						generatorLevel: 1,
						intervalFrom: null,
						intervalTo: null,

						topicsStatus: [
							false, // 1	"+",
							false, // 2	"-",
							false, // 3	"×",
							false, // 4	"/",
							false, // 5	"²",
							false, // 6	"²√",
							false, // 7	"³",
							false, // 8	"³√",
							false, // 9	"!",
							// false, // 10  "log",
							// false, // 11  "cos",
						],

						writeIntervalFrom: false,
						writeIntervalTo: false,
						intervalFromError: false,
						intervalToError: false,
					},

					arcadeResultsHistory: [],

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
					comboOfCorrect: null,
					countOfCorrect: null,
					countOfAllProblems: null,

					messageIdOther: null,
				});
			}

			const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

			if (dataAboutUser) {
				if (
					dataAboutUser.userAction == "mathArcade1" &&
					/^-?\d+$/.test(text)
				) {
					dataAboutUser.enteredResult = parseInt(text);
					mathArcade(chatId, 2);
				}

				if (dataAboutUser.userAction == "firstMeeting2") {
					dataAboutUser.login = text;
					firstMeeting(chatId, 3);
				}

				if (text.includes("mathArcade")) {
					match = text.match(/^mathArcade(.*)$/);

					mathArcade(chatId, parseInt(match[1]));
				}

				if (
					(dataAboutUser.arcadeData.writeIntervalFrom ||
						dataAboutUser.arcadeData.writeIntervalTo) &&
					/^-?\d+$/.test(text)
				) {
					if (dataAboutUser.arcadeData.writeIntervalFrom) {
						dataAboutUser.arcadeData.intervalFrom = parseInt(text);
						dataAboutUser.arcadeData.generatorLevel = 0;
						dataAboutUser.arcadeData.writeIntervalFrom = false;
						if (
							dataAboutUser.arcadeData.intervalFrom >=
							dataAboutUser.arcadeData.intervalTo
						)
							dataAboutUser.arcadeData.intervalFromError = true;
						else {
							dataAboutUser.arcadeData.intervalFromError = false;
							dataAboutUser.arcadeData.intervalToError = false;
						}
					} else if (dataAboutUser.arcadeData.writeIntervalTo) {
						dataAboutUser.arcadeData.intervalTo = parseInt(text);
						dataAboutUser.arcadeData.generatorLevel = 0;
						dataAboutUser.arcadeData.writeIntervalTo = false;
						if (
							dataAboutUser.arcadeData.intervalFrom >=
							dataAboutUser.arcadeData.intervalTo
						)
							dataAboutUser.arcadeData.intervalToError = true;
						else {
							dataAboutUser.arcadeData.intervalFromError = false;
							dataAboutUser.arcadeData.intervalToError = false;
						}
					}

					mathArcade(chatId, 0);
				}

				if (text.includes("setLevel")) {
					match = text.match(/^setLevel(.*)In(.*)$/);

					if (parseInt(match[1]) > 5)
						dataAboutUser.arcadeData.generatorLevel = 1;
					else if (parseInt(match[1]) < 1)
						dataAboutUser.arcadeData.generatorLevel = 5;
					else
						dataAboutUser.arcadeData.generatorLevel = parseInt(match[1]);

					if (match[2] == "MathArcade1") mathArcade(chatId, 1, false);
				}

				switch (text) {
					case "/start":
					case "/restart":
						firstMeeting(chatId);
						break;
					case "st":
					case "St":
						if (chatId == qu1z3xId) {
							await bot
								.sendMessage(chatId, "ㅤ")
								.then(
									(message) =>
										(dataAboutUser.messageId = message.message_id)
								);

							menuHome(chatId);
						}
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
		} catch (error) {
			console.log(error);
			sendDataAboutError(chatId, `${String(error)}`);
		}
	});

	bot.on("callback_query", (query) => {
		const chatId = query.message.chat.id;
		const data = query.data;

		const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

		try {
			if (dataAboutUser) {
				if (data.includes("firstMeeting")) {
					match = data.match(/^firstMeeting(\d+)$/);

					firstMeeting(chatId, parseInt(match[1]));
				} else if (data.includes("toggleForTopicNum")) {
					match = data.match(/^toggleForTopicNum(.*)$/);

					dataAboutUser.schoolClassNum = 12;

					dataAboutUser.arcadeData.topicsStatus[parseInt(match[1])] =
						!dataAboutUser.arcadeData.topicsStatus[parseInt(match[1])];

					topicsList(chatId);
				} else if (data.includes("setSchoolClassNum")) {
					match = data.match(/^setSchoolClassNum(\d+)In(.*)$/);

					dataAboutUser.schoolClassNum = parseInt(match[1]);
					curriculumCreating(chatId);

					dataAboutUser.arcadeData.writeIntervalFrom = false;
					dataAboutUser.arcadeData.writeIntervalTo = false;

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
						dataAboutUser.arcadeData.generatorLevel = 1;
					else if (parseInt(match[1]) < 1)
						dataAboutUser.arcadeData.generatorLevel = 5;
					else
						dataAboutUser.arcadeData.generatorLevel = parseInt(match[1]);

					dataAboutUser.arcadeData.writeIntervalFrom = false;
					dataAboutUser.arcadeData.writeIntervalTo = false;

					if (match[2] == "MathArcade0") mathArcade(chatId, 0);
				} else if (data.includes("toggleWriteInterval")) {
					match = data.match(/^toggleWriteInterval(.*)$/);

					if (match[1] == "From") {
						dataAboutUser.arcadeData.writeIntervalFrom =
							!dataAboutUser.arcadeData.writeIntervalFrom;

						dataAboutUser.arcadeData.writeIntervalTo = false;
					} else if (match[1] == "To") {
						dataAboutUser.arcadeData.writeIntervalTo =
							!dataAboutUser.arcadeData.writeIntervalTo;

						dataAboutUser.arcadeData.writeIntervalFrom = false;
					}

					mathArcade(chatId, 0);
				}

				switch (data) {
					case "exit":
						menuHome(chatId);
						break;
					case "nextMathProblemGeneration":
						dataAboutUser.comboOfCorrect = 0;

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
							dataAboutUser.arcadeData.topicsStatus[i] = false;

						dataAboutUser.schoolClassNum = 12;

						topicsList(chatId);
						break;
					case "":
						break;
					case "":
						break;
					case "settings":
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
					case "":
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
		} catch (error) {
			console.log(error);
			sendDataAboutError(chatId, `${String(error)}`);
		}
	});
}

StartAll();

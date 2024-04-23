import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import fs from "fs";

import { sendDataAboutButton } from "./tgterminal.js";
import { sendDataAboutError } from "./tgterminal.js";
import { sendDataAboutText } from "./tgterminal.js";

const TOKENs = [
	"6654105779:AAEnCdIzKS_cgJUg4rMY8yNM3LPP5iZ-d_A",
	"7065552948:AAGJUvNrQVU_sBHK4UrTrFz5Dpy4fccdycQ",
];

const TOKEN = TOKENs[1]; // 1 - оригинал
const bot = new TelegramBot(TOKEN, { polling: true });

const qu1z3xId = "923690530";
const jackId = "6815420098";
let BotName = "digmathbot";

let usersData = [];

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
		switch (numOfStage) {
			case 1:
				dataAboutUser.userAction = "firstMeeting1";

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
										text: "Поехали! 🚀",
										callback_data: "firstMeeting2",
									},
								],
							],
						},
					}
				);
				break;
			case 2:
				dataAboutUser.userAction = "firstMeeting2";

				await bot.editMessageText(
					`<b>Отлично ${dataAboutUser.login},</b> я чувствую <B>твой настрой!</B> 😃\n\nДавай знакомиться <b>ближе!</b>\n\n<b>Напиши ниже свое имя 👇</b>`,
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
				dataAboutUser.userAction = "firstMeeting3";

				await bot.editMessageText(
					`Пожалуйста, <b><i>ознакомься</i></b> с <b><a href="https://t.me/${BotName}/?start=rules">правилами пользования ресурсом</a></b>❗`,
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
										text: "Правила пользования 📃",
										callback_data: `rulesBot`,
									},
								],
							],
						},
					}
				);
				break;
			case 4:
				dataAboutUser.userAction = "firstMeeting4";

				dataAboutUser.number1 =
					Math.floor(Math.random() * (100 - 50 + 1)) + 50;

				dataAboutUser.number2 =
					Math.floor(Math.random() * (100 - 50 + 1)) + 50;

				await bot.editMessageText(
					`<b>Супер,</b> теперь я могу <b>тебе доверять!</b> 😍\n\nДавай определимся с твоим <b>арифметическим уровнем!</b>\n\nРеши пример, <b>без использования</b> калькулятора:\n<blockquote><b>${dataAboutUser.number1} × ${dataAboutUser.number2} = ?</b></blockquote>\n\n`,
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
										text: "Пока что пофиг 🥸",
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

async function rulesBot(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	const rulesBotText = `<b><i>🧮 Правила пользования 📃</i>\n\n❗ЭТО ОЧЕНЬ ВАЖНО❗\n\n-  Пользоваться приложением строго в благих целях🌍\n\n-  Не совершать намеренные нарушения правил, или создание сбоев. ❌\n\n-  Бот не отвечает - команда /restart в твоем распоряжении! 😉\n\n-  Нашлась ошибка? Бот по-прежнему не отвечает? Есть замечания по работе проекта? - пожалуйста, сообщи об этом в нашу поддержку: @digfusion 👍\n\n-  Также принимая правила, ты разрешаешь использование личных данных, полученных в рамках нашего с тобой диалогаю 😉🔒</b>`;

	try {
		await bot.editMessageText(`${rulesBotText}`, {
			parse_mode: "html",
			chat_id: chatId,
			message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
			disable_web_page_preview: true,
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: `${
								dataAboutUser.userAction == "firstMeeting3"
									? "Я принимаю правила ✅"
									: dataAboutUser.userAction == "options"
									? "⬅️Назад"
									: ""
							}`,
							callback_data: `${
								dataAboutUser.userAction == "firstMeeting3"
									? "firstMeeting4"
									: dataAboutUser.userAction == "options"
									? "options"
									: ""
							}`,
						},
						{
							text: `${
								dataAboutUser.userAction == "firstMeeting3"
									? ""
									: dataAboutUser.userAction == "options"
									? "Поддержка 🗯️"
									: ""
							}`,
							url: "https://t.me/digfusion",
						},
					],
				],
			},
		});
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

		dataAboutUser.comboOfCorrect = 0;

		await bot.editMessageText(
			`<b>${textToSayHello}, ${dataAboutUser.login}!\nЧем я могу помочь? 🤓</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "Арифметическая аркада 🧮",
								callback_data: "generatingMathProblems1",
							},
						],
						[{ text: "Настройки ⚙️", callback_data: "options" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

function calculate(number1, operator, number2) {
	switch (operator) {
		case 0:
			return number1 + number2;
		case 1:
			return number1 - number2;
		case 2:
			return number1 * number2;
		case 3:
			return number1 / number2;
		case 4:
			if (number1 === 0 || number1 === 1) {
				return 1;
			} else {
				let result = 1;
				for (let i = 2; i <= number1; i++) {
					result *= i;
				}
				return result;
			}
	}
}

async function generatingMathProblems(chatId, numOfStage = 1) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		let operators = [];

		switch (numOfStage) {
			case 1:
				dataAboutUser.mathLevel = 2;

				switch (dataAboutUser.mathLevel) {
					case 1:
						operators = ["+", "-"];

						dataAboutUser.number1 =
							Math.floor(Math.random() * (100 - 2 + 1)) + 2;

						dataAboutUser.number2 =
							Math.floor(Math.random() * (100 - 2 + 1)) + 2;

						dataAboutUser.operatorNum = Math.floor(
							Math.random() * operators.length
						);

						dataAboutUser.result = calculate(
							dataAboutUser.number1,
							dataAboutUser.operatorNum,
							dataAboutUser.number2
						);

						break;
					case 2:
						operators = ["+", "-", "×", "/"];

						dataAboutUser.operatorNum = Math.floor(
							Math.random() * operators.length
						);
						do {
							dataAboutUser.number1 =
								Math.floor(Math.random() * (100 - 2 + 1)) + 2;

							dataAboutUser.number2 =
								Math.floor(Math.random() * (100 - 2 + 1)) + 2;
						} while (
							(dataAboutUser.number1 % dataAboutUser.number2 !== 0 &&
								dataAboutUser.operatorNum == 3) ||
							dataAboutUser.number1 / dataAboutUser.number2 == 0 ||
							(dataAboutUser.number1 + dataAboutUser.number2 >= 50 &&
								dataAboutUser.operatorNum == 2)
						);

						dataAboutUser.result = calculate(
							dataAboutUser.number1,
							dataAboutUser.operatorNum,
							dataAboutUser.number2
						);
						break;
					case 3:
						break;
				}

				dataAboutUser.userAction = "generatingMathProblems1";

				await bot.editMessageText(
					`<b><i>Арифметическая аркада 🧮</i></b>\n\nСложность: <b>${
						dataAboutUser.mathLevel
					}-я\n${
						dataAboutUser.comboOfCorrect != 0
							? `( ${dataAboutUser.comboOfCorrect}x ) `
							: ``
					}Реши пример:<blockquote>${dataAboutUser.number1} ${
						operators[dataAboutUser.operatorNum]
					} ${
						dataAboutUser.number2
					} = ...  <a href="1">💡</a></blockquote>\n\n</b>`,
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
										text: "⬅️В меню",
										callback_data: "exit",
									},
									{
										text: "Дальше ➡️",
										callback_data: "nextProblemGeneration",
									},
								],
							],
						},
					}
				);
				break;
			case 2:
				if (dataAboutUser.enteredResult == dataAboutUser.result) {
					dataAboutUser.comboOfCorrect++;
					setTimeout(() => {
						generatingMathProblems(chatId, 1);
					}, 2300);
				} else {
					dataAboutUser.comboOfCorrect = 0;
				}

				operators = ["+", "-", "×", "/"];

				dataAboutUser.userAction = "generatingMathProblems2";

				await bot.editMessageText(
					`<b><i>Арифметическая аркада 🧮</i></b>\n\nСложность: <b>${
						dataAboutUser.mathLevel
					}-я\n${
						dataAboutUser.comboOfCorrect != 0
							? `Подряд ( ${dataAboutUser.comboOfCorrect}x )\n`
							: ``
					}Ответ примера:<blockquote>${dataAboutUser.number1} ${
						operators[dataAboutUser.operatorNum]
					} ${dataAboutUser.number2} ${
						dataAboutUser.enteredResult == dataAboutUser.result
							? "="
							: `≠`
					} ${dataAboutUser.enteredResult} ${
						dataAboutUser.enteredResult == dataAboutUser.result
							? `✅ Верно`
							: `❌ Неверно\nОтвет: ${dataAboutUser.result}`
					}</blockquote>\n\n</b>`,
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
										text: "⬅️В меню",
										callback_data: "exit",
									},
									{
										text: `${
											dataAboutUser.enteredResult ==
											dataAboutUser.result
												? ""
												: `Дальше ➡️`
										}`,
										callback_data: "generatingMathProblems1",
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

async function StartAll() {
	try {
		if (TOKEN == TOKENs[0]) {
			BotName = "digtestingbot";
		} else if (TOKEN == TOKENs[1]) {
			BotName = "digtestingbot";
		}

		bot.on("message", async (message) => {
			const chatId = message.chat.id;
			const text = message.text;

			if (!usersData.find((obj) => obj.chatId === chatId)) {
				usersData.push({
					chatId: chatId,
					login: message.from.first_name,
					telegramFirstName: message.from.first_name,
					messageId: null,
					userAction: null,
					mathLevel: 1,

					countOfNumbers: null,
					number1: null,
					number2: null,
					// number3: null,
					// number4: null,
					// number5: null,
					// number6: null,
					result: null,
					enteredResult: null,
					comboOfCorrect: null,
				});
			}

			const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

			if (dataAboutUser) {
				// ? ОБРАБОТЧИК НАЧАЛ СЛОВОСОЧЕТАНИЙ
				if (
					dataAboutUser.userAction == "generatingMathProblems1" &&
					/^-?\d+$/.test(text)
				) {
					dataAboutUser.enteredResult = parseInt(text);
					generatingMathProblems(chatId, 2);
				}

				if (dataAboutUser.userAction == "firstMeeting2") {
					dataAboutUser.login = text;
					firstMeeting(chatId, 3);
				}

				switch (text) {
					case "/start":
					case "/restart":
						firstMeeting(chatId);
						break;
					case "st":
					case "St":
						await bot
							.sendMessage(chatId, "ㅤ")
							.then(
								(message) =>
									(dataAboutUser.messageId = message.message_id)
							);

						menuHome(chatId);
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
		});

		bot.on("callback_query", (query) => {
			const chatId = query.message.chat.id;
			const data = query.data;

			const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

			if (dataAboutUser) {
				if (data.includes("firstMeeting")) {
					match = data.match(/^firstMeeting(\d+)$/);

					firstMeeting(chatId, parseInt(match[1]));
				}

				if (data.includes("generatingMathProblems")) {
					match = data.match(/^generatingMathProblems(\d+)$/);

					generatingMathProblems(chatId, parseInt(match[1]));
				}
				switch (data) {
					case "exit":
						menuHome(chatId);
						break;
					case "rulesBot":
						rulesBot(chatId);
						break;
					case "nextProblemGeneration":
						dataAboutUser.comboOfCorrect = 0;

						generatingMathProblems(chatId, 1);
						break;
					case "":
						break;
					case "":
						break;
					case "":
						break;

					default:
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
		});
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, `${String(error)}`);
	}
}

StartAll();

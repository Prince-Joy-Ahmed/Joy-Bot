const os = require('os');
const fs = require('fs').promises;
const pidusage = require('pidusage');

module.exports = {
		config: {
				name: 'uptime',
				version: '2.1.0',
				author: "Cliff", // Do not change credits
				countDown: 5,
				role: 0,
				shortDescription: 'shows how long uptime',
				longDescription: {
						en: ''
				},
				category: 'system',
				guide: {
						en: '{p}uptime'
				}
		},

		byte2mb(bytes) {
				const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
				let l = 0, n = parseInt(bytes, 10) || 0;
				while (n >= 1024 && ++l) n = n / 1024;
				return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
		},

		async getStartTimestamp() {
				try {
						const startTimeStr = await fs.readFile('uptime_start_time.txt', 'utf8');
						return parseInt(startTimeStr);
				} catch (error) {
						// If file doesn't exist or there's an error reading it, return current timestamp
						return Date.now();
				}
		},

		async saveStartTimestamp(timestamp) {
				try {
						await fs.writeFile('uptime_start_time.txt', timestamp.toString());
				} catch (error) {
						console.error('Error saving start timestamp:', error);
				}
		},

		getUptime(uptime) {
				const days = Math.floor(uptime / (3600 * 24));
				const hours = Math.floor((uptime % (3600 * 24)) / 3600);
				const mins = Math.floor((uptime % 3600) / 60);
				const seconds = Math.floor(uptime % 60);

				return `Uptime: ${days} day(s), ${hours} hour(s), ${mins} minute(s), and ${seconds} second(s)`;
		},

		onStart: async ({ api, event }) => {
				const startTime = await module.exports.getStartTimestamp();
				const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
				const days = Math.floor(uptimeSeconds / (3600 * 24));
				const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
				const minutes = Math.floor((uptimeSeconds % 3600) / 60);
				const seconds = Math.floor(uptimeSeconds % 60);

				const usage = await pidusage(process.pid);

				const osInfo = {
						platform: os.platform(),
						architecture: os.arch()
				};

				const timeStart = Date.now();
				const uptimeMessage = module.exports.getUptime(uptimeSeconds);
				const returnResult = `┃======{ 𝗨𝗣𝗧𝗜𝗠𝗘 𝗥𝗢𝗕𝗢𝗧 }======┃\n\n→ 𝐁𝐨𝐭 𝐖𝐨𝐫𝐤𝐞𝐝  ${hours} hours ${minutes} minutes ${seconds} seconds \n•━━━━━━━━━━━━━━━━━━━━━━━━•\n➠ 𝗠𝗗 𝗝𝗨𝗕𝗔𝗘𝗗 𝗔𝗛𝗠𝗘𝗗 𝗝𝗢𝗬\n➠ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: ${global.config.BOTNAME}\n➠ 𝐁𝐨𝐭 𝐏𝐫𝐞𝐟𝐢𝐱: ${global.config.PREFIX}\n➠ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐜𝐨𝐮𝐧𝐭: ${commands.size}\n➠ 𝐓𝐨𝐭𝐚𝐥 𝐔𝐬𝐞𝐫: ${global.data.allUserID.length}\n➠ 𝐓𝐨𝐭𝐚𝐥 𝐓𝐡𝐞𝐚𝐝: ${global.data.allThreadID.length}\n➠ 𝐂𝐏𝐔 𝐈𝐧 𝐔𝐬𝐞:: ${pidusage.cpu.toFixed(1)}%\n➠ 𝐑𝐚𝐦: ${byte2mb(pidusage.memory)}\n➠ 𝐏𝐢𝐧𝐠: ${Date.now() - timeStart}ms\n➠ 𝐂𝐡𝐚𝐫𝐚𝐜𝐭𝐞𝐫 𝐈𝐝: ${id}\n•━━━━━━━━━━━━━━━━━━━━━━━━•\n[ ${timeNow} ]`;

				await module.exports.saveStartTimestamp(startTime); // Save the start time again to ensure it's updated
				return api.sendMessage(returnResult, event.threadID, event.messageID);
		}
};

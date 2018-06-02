const instParser = require('./lib/parser.js');
const download = require('image-downloader');
const CONFIG = require('./config.json');
const color = require('chalk');
const fs = require('fs');

/** @type {String} instagram nickname, this is only required argument, other can be set on config */
const NAME    = process.argv[2];
/** @type {Number} defines how many post will requsted per page, recommended big number like 20 (probably this is instagram posts limit per page, i'm not sure), because less = more requests*/
const LIMIT   = process.argv[3] || CONFIG.postsLimit;
/** @type {(Number|String)} defines how many paged will be requsted, also can be a string 'ALL' to get all content */
let IT 	  	  = process.argv[4] || CONFIG.pageLimit;
/** @type {Boolean} Option for saving main data about user. (bio, subs, name, id, etc.) */
const SDATA   = process.argv[5] || CONFIG.saveData;
/** @type {Boolean} this one will disable logging */
const DEBUG   = process.argv[6] || CONFIG.logger.enabled;
/** @type {Boolean} if true passed, will show only default color */
const NOCOLOR = process.argv[7] || CONFIG.logger.noColors;

/**
 * Costum messages log handling
 * @param {String} x
 * @param {Object} [options]
 * @param {String} [options.pref=info]
 * @param {Boolean} [options.debug=DEBUG]
 * @param {Boolean} [options.nocolor=NOCOLOR]
 */
const LOGGER = (x, options = {'pref' : 'info', 'debug' : DEBUG, 'nocolor' : NOCOLOR}) => {
	if (DEBUG || options.debug) {
		// actually, this is console log with one string ([prefix] [time] text)
		console.log(color[options.nocolor ? 'default' : CONFIG.logger.data[options.pref.toLowerCase()].color](`${CONFIG.logger.data[options.pref.toLowerCase()].pref} [${new Date().toLocaleTimeString()}] ${x}`));
	}
};

LOGGER(`Starting inst parser for ${NAME}`);
LOGGER(LIMIT == CONFIG.postsLimit ? `Posts limit is not set. Default is ${CONFIG.postsLimit}.` : `Posts limit is ${LIMIT}`);

if (!fs.existsSync(CONFIG.outputPath)) {
	fs.mkdirSync(CONFIG.outputPath);
	LOGGER('Creating main folder for output');
}

if (typeof IT == 'string' && IT.toLowerCase() == 'all') {
	LOGGER('Parse limit is "ALL" now');
	// if page limit is set to 'ALL' it will be just like parsing of big amount of pages,
	// but however script will break loop when it reach last page
	IT = 0xFFF; // TODO
} else if (!IT) {
	LOGGER('Parse limit can not be false', {'pref' : 'error'});
	process.exit(1);
} else LOGGER(`Parse limit is ${IT} now`);


if (NAME && CONFIG.cookie) {
	/** @type {instParser} pass name to constructor */
	const INST = new instParser(NAME, CONFIG.photoQuality, CONFIG.cookie);

	INST.getUser().then(data => {
		/** @type {Number} user ID */
		let ID = data.id;
		LOGGER(`Got ID - ${ID}`);
		LOGGER(`Starting parser user ${NAME}...`);
		let path = CONFIG.outputPath + NAME;
		// Creating folder for this user
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
			LOGGER(`Creating folder for current account. Path - ${path}`);
		}
		// if SDATA constant set to true, then we try save data to file data.json
		// in end path (outPath+name)
		if (SDATA) INST.saveProfileData(data, path).catch(e => {
			// You'll be informed about errors in writing data
			// No message will be shown if no errors
			LOGGER(`Some error occured while saving profile data: ${e}`, {'pref' : 'warn'});
		});

		/**
		* parser itself
		* @param  {String} ID
		* @param  {?Number} [NEXT=null]
		* @param  {Number} [IITER=0]
		*/
		const parse = (ID, NEXT = null, IITER = 0) => {
			INST.parse(ID, LIMIT, NEXT).then(data => {
				for (let img of data.body) {
					download.image({
						'url'  : img.url,
						'dest' : CONFIG.outputPath + NAME
					}).then(_ => LOGGER(`Downloaded ID${img.id}`, { 'pref' : 'log' }));
				}
				IITER++;
				if (data.has_next_page && IITER < IT) parse(ID, data.end_cursor, IITER);
				else LOGGER('Parse done.');
			}).catch(e => LOGGER(e, {'pref' : 'error'}));
		}

		parse(ID);

	}).catch(e => LOGGER(e, {'pref' : 'error'})); // Catch error while getting user
} else {
	// Name or cookie isn't passed
	LOGGER(`is name passed: ${!!NAME}, is cookie passed: ${!!CONFIG.cookie}`, {'pref' : 'error'});
	process.exit(1);
}

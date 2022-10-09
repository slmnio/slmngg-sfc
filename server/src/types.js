/**
 * @namespace typedefs
 */


/* Basic types */
/**
 * @typedef {string} DirtyAirtableID
 */
/**
 * @typedef {string} CleanAirtableID
 */
/**
 * @typedef {DirtyAirtableID|CleanAirtableID} AnyAirtableID
 */
/**
 * @typedef {string} DiscordID
 */


/**
 * @typedef {Object} ClientData
 * @property {string} name
 * @property {string} key
 * @property {DirtyAirtableID[]} staff
 * @property {DirtyAirtableID[]} broadcast
 * @property {DirtyAirtableID} id
 */


/**
 * @typedef {Object} DiscordUserData
 *
 * @property {DiscordID} id
 * @property {string} username
 * @property {string} discriminator
 * @property {string?} avatar - Avatar image hash
 * @property {string?} banner - Banner image hash
 * @property {string?} accent_color - Hex code for their banner
 * @property {string?} locale
 */
/**
 * @typedef {Object} AirtableUserData
 *
 * @property {string} name
 * @property {string?} pronunciation
 * @property {string?} pronouns
 * @property {string?} role
 * @property {boolean?} verified
 * @property {string[]?} twitter_handle
 * @property {string[]?} twitter_link
 * @property {string[]?} website_settings
 * @property {string?} battletag - Battle.net battletag
 * @property {string?} discord_tag - Discord tag
 * @property {DiscordID?} discord_id - Discord ID (but use user.discord.id)
 *
 * @property {DirtyAirtableID[]?} member_of - Teams this player plays for
 * @property {DirtyAirtableID[]?} event_staff
 * @property {DirtyAirtableID[]?} team_staff
 * @property {DirtyAirtableID[]?} casts
 * @property {DirtyAirtableID[]?} casted_events
 * @property {DirtyAirtableID[]?} socials
 * @property {DirtyAirtableID[]?} news
 * @property {DirtyAirtableID[]?} live_guests
 * @property {DirtyAirtableID[]?} player_relationships
 * @property {DirtyAirtableID[]?} clients
 * @property {DirtyAirtableID[]?} teams
 * @property {DirtyAirtableID[]?} favourite_hero
 * @property {DirtyAirtableID[]?} highlighted_on
 *
 */

/**
 * @typedef CacheGetFunction
 * @param {AnyAirtableID} id - AirtableID
 * @returns {Promise<object>}
 */

/**
 * @typedef {Object} UserData
 *
 * @property {DiscordUserData} discord - Discord data for the user
 * @property {AirtableUserData} airtable - Airtable (SLMN.GG) data for the user
 */

/**
 * @typedef ActionSuccessCallback
 * @param {*?} data - return data
 */
/**
 * @typedef ActionErrorCallback
 * @param {string} errorMessage - error message
 * @param {number?} statusCode - HTTP status code to send with response
 */

/**
 * @typedef {Object} UpdateRecordResponse
 * @property {boolean?} error - True if an error occurred
 */
/**
 * @typedef SimpleUpdateRecord
 * @async
 * @param {string} tableName - Airtable table name
 * @param {object} item - Original item data
 * @param {object} changes - New data to change
 * @returns {Promise<UpdateRecordResponse>}
 */

/**
 * @typedef {'create'|'lock'|'resolve'|'cancel'} PredictionAction
 */

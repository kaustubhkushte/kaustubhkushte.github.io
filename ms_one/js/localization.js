var Localization = function() {};
Localization.prototype.init = function() {
    this._strings = [], this._language = null, navigator && navigator.userAgent && (this._language = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i)) && (this._language = this._language[1]), !this._language && navigator && (navigator.languages ? this._language = navigator.languages[0] : navigator.language ? this._language = navigator.language : navigator.browserLanguage ? this._language = navigator.browserLanguage : navigator.systemLanguage ? this._language = navigator.systemLanguage : navigator.userLanguage && (this._language = navigator.userLanguage), this._language && (console.log("Truncating language: " + this._language), this._language = this._language.substr(0, 2))), this._language || (this._language = "en"), console.log("Language: " + this._language)
}, Localization.prototype.registerString = function(string, translations) {
    console.log("localization: registering string:", string), this._strings[string] = translations
}, Localization.prototype.registerStrings = function(translations) {
    for (var string in translations) this.registerString(string, translations[string])
}, Localization.prototype.getLanguage = function() {
    return this._language
}, Localization.prototype.get = function(string, macros) {
    var s = string;
    if (this._strings[string] && this._strings[string][this._language] && (s = this._strings[string][this._language]), macros)
        for (var macro in macros) s = s.replace(macro, macros[macro]);
    return s
}, Localization.prototype.fitText = function(field, width, height) {
    if (field.defaultFontSize || (field.defaultFontSize = field.fontSize.replace(/\D/g, "")), field.fontSize = field.defaultFontSize + "pt", field.wordWrap && (width = field.wordWrapWidth), width > 0 && height > 0)
        for (var size = field.defaultFontSize;
            (field.width > width || field.height > height) && size > 4;) size -= 1, field.fontSize = size + "pt"
};
var localization = new Localization;
localization.init();
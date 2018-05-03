var targdir = require('./wherefolder').targetfolder,
//index represents parent index in pages. just start counting at 0
pages = [
	["cdn/ssmain/ssmain-app.html", 0, 0],
	["cdn/ssmain/admin-components.html", 0, 0],
	["cdn/components/create/create-modal.html", 0, 1],
	["cdn/components/shop/shop-container.html", 0, 0],
	["cdn/components/support_about_legal/sal-holder.html", 0, 0],
	["cdn/components/newprod/ss-new-item-pop.html",0, 1],
	["cdn/components/chat/chat.html",0, 1],
	["cdn/components/account/my-account.html",0, 1],

	["cdn/components/modals/edit.html",0, 1],
	["cdn/components/sviews/listing.html", 0, 0],
	["cdn/components/sviews/ask-question.html", 0, 1],

	["cdn/components/bruno/internal-core.html", 2, 0],
	["cdn/components/bruno/photo-core.html", 2, 0],
	["cdn/components/bruno/collage-core.html", 2, 0]
];

logmode = true;

module.exports = {'targetfolder':targdir, 'mainpages': pages, 'canwrite': logmode};
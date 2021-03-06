if (!funambol) var funambol={};
if (!funambol.subitosms) funambol.subitosms={};
if (!funambol.subitosms.sendsms) funambol.subitosms.sendsms = {};

funambol.subitosms.sendsms.init = function init() {
    //
    // Lable localization
    //
    funambol.subitosms.sendsms.localizeLabels();
    
    //
    // I want to display the numbers in this order:
    //
    // - mobile
    // - home
    // - work
    //
    card = window.arguments[0];

    phonelist = document.getElementById("sendsms.phonelist.menu");
    if (!funambol.subitosms.util.isEmpty(card.cellularNumber)) {
        phonelist.appendItem(card.cellularNumber, card.cellularNumber, "(M)");
    }
    
    if (!funambol.subitosms.util.isEmpty(card.homePhone)) {
        phonelist.appendItem(card.homePhone, card.homePhone, "(H)");
    }
    
    if (!funambol.subitosms.util.isEmpty(card.workPhone)) {
        phonelist.appendItem(card.workPhone, card.workPhone, "(W)");
    }

    //
    // After the card phone numbers, I want to display the latest used number
    //
    lastNumbers = funambol.subitosms.sendsms.getLastUsedNumbers();
    if (lastNumbers.getSize() > 0) {
        var separator = document.createElement("menuseparator");
        document.getElementById("sendsms.phonelist.menu.popup").appendChild(separator);

        for (i = 0; i<lastNumbers.getSize(); ++i) {
            phonelist.appendItem(lastNumbers.get(i));
        }
    }

    phonelist.selectedIndex=0;
}

funambol.subitosms.sendsms.onMainWindowLoad = function onMainWindowLoad() {
    funambol.subitosms.sendsms.init();
}


funambol.subitosms.sendsms.doAccept = function doAccept() {
    var card = window.arguments[0];

    if (funambol.subitosms.util.isDefined(card)) {
        return funambol.subitosms.sendsms.sendSMS();
    }

    return true;
}

funambol.subitosms.sendsms.makeSubitoURL = function makeSubitoURL(msg, number) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefBranch);

    var username = funambol.subitosms.util.escapeText(
            prefs.getComplexValue("subitosms.username", Components.interfaces.nsISupportsString).data
        );
    var password = funambol.subitosms.util.escapeText(
            prefs.getComplexValue("subitosms.password", Components.interfaces.nsISupportsString).data
        );
    var mitt = funambol.subitosms.util.escapeText(
            prefs.getComplexValue("subitosms.from", Components.interfaces.nsISupportsString).data
        );
    var dest = funambol.subitosms.util.escapePhoneNumber(number);
    var testo = funambol.subitosms.util.escapeText(msg);

    var url = "https://www.subitosms.it/gateway.php"
            + "?username=" + username
            + "&password=" + password
            + "&mitt="     + mitt
            + "&dest="     + dest
            + "&testo="    + testo
            ;

    return url;
}

funambol.subitosms.sendsms.analizeResponse = function analizeResponse(res) {
    if (res.indexOf("non autorizzato") >= 0) {
        alert(funambol.subitosms.i18n.getString("sendsms.alert.notauthorized"));
    } else if (res.indexOf("credito insufficiente") >= 0) {
        alert(funambol.subitosms.i18n.getString("sendsms.alert.nocredit"));
    } else if (res.indexOf("id:") == 0) {
        alert(funambol.subitosms.i18n.getString("sendsms.alert.sent"));
        return true;
    } else {
        alert(funambol.subitosms.i18n.getString("sendsms.subito.error") + ":" + res);
    }

    return false;
}

funambol.subitosms.sendsms.getMessage = function getMessage() {
    return document.getElementById("sendsms.message.textbox").value;
}

funambol.subitosms.sendsms.getNumber = function getNumber() {
    return document.getElementById("sendsms.phonelist.menu").value;
}

funambol.subitosms.sendsms.getLastUsedNumbers = function getLastUsedNumbers() {
    lastNumbers = new funambol.subitosms.util.FILOArray();

    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefBranch);


    try {
        lastNumbers.fromString(
            prefs.getComplexValue(
                "subitosms.last-numbers",
                Components.interfaces.nsISupportsString
            ).data
        );
    } catch (e) {
        //
        // Not yet initialized, do nothing, he array will be empty
        //
    }

    return lastNumbers;
}

funambol.subitosms.sendsms.rememberNumber = function rememberNumber(number) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefBranch);

    var lastNumbers = funambol.subitosms.sendsms.getLastUsedNumbers();

    lastNumbers.add(number);

    prefs.setCharPref(
        "subitosms.last-numbers",
        lastNumbers.toString()
    );
}

funambol.subitosms.sendsms.isValidMessage = function isValidMessage(msg) {
    return !funambol.subitosms.util.isEmpty(msg);
}

funambol.subitosms.sendsms.isValidPhoneNumber = function isValidPhoneNumber(number) {
    if (funambol.subitosms.util.isEmpty(number)) {
        return false;
    }

    number = funambol.subitosms.util.escapePhoneNumber(number);
    number = funambol.subitosms.util.trim(number);

    //
    // If there was not any digit, number will be empty or contain only %2B
    //
    if (funambol.subitosms.util.isEmpty(number) || (number == "%2B")) {
        return false;
    }

    return true;
}

funambol.subitosms.sendsms.checkConfiguration = function checkConfiguration() {
    try {
        funambol.subitosms.configure.loadConfiguration();
    } catch (e) {
        return false;
    }

    return true;
}


funambol.subitosms.sendsms.sendSMS = function sendSMS() {
    //
    // If there is not a valid configuration, ask the user to configure
    // subitosms first.
    //
    if (!funambol.subitosms.sendsms.checkConfiguration()) {
        alert(funambol.subitosms.i18n.getString("sendsms.alert.noconfiguration"));
        if (!funambol.subitosms.sendsms.showConfigureWindow()) {
            //
            // If the user pressed cancel, do not send the message and keep the
            // send sms window open
            //
            return false;
        }
    }

    var msg = funambol.subitosms.sendsms.getMessage();
    var number = funambol.subitosms.sendsms.getNumber();

    if (!funambol.subitosms.sendsms.isValidMessage(msg)) {
        alert(funambol.subitosms.i18n.getString("sendsms.alert.nomessage"));
        return false;
    }

    if (!funambol.subitosms.sendsms.isValidPhoneNumber(number)) {
        alert(funambol.subitosms.i18n.getString("sendsms.alert.invalidnumber"));
        return false;
    }

    var url = funambol.subitosms.sendsms.makeSubitoURL(msg, number);

    var res = funambol.subitosms.util.httpGET(url);

    if (res == false) {
        //
        // ERROR!!!
        //
        return false;
    }

    funambol.subitosms.sendsms.rememberNumber(number);

    return funambol.subitosms.sendsms.analizeResponse(res);
}

funambol.subitosms.sendsms.showConfigureWindow = function showConfigureWindow() {
    var ret = {saved: false};
    openDialog(
        "chrome://subitosms/content/configure.xul",
        "configure",
        "chrome,width=400,height=200,modal,resizable=no,centerscreen",
        ret
    );

    return ret.saved;
}

funambol.subitosms.sendsms.localizeLabels = function localizeLabels() {
    document.title=funambol.subitosms.i18n.getString("sendsms.window.title");
    document.documentElement.getButton("accept").label = funambol.subitosms.i18n.getString("sendsms.window.accept.label");
    document.documentElement.getButton("cancel").label = funambol.subitosms.i18n.getString("sendsms.window.cancel.label");
    document.getElementById("sendsms.phonelist").value = funambol.subitosms.i18n.getString("sendsms.phonelist.value");
    document.getElementById("sendsms.subitosmsbutton.configure").tooltipText = funambol.subitosms.i18n.getString("sendsms.subitosmsbutton.configure.tooltip");
}

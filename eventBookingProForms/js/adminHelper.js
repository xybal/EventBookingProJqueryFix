var EbpFormsAdminModel = new function() {
	this.FieldTypes = {
		name: ["Name Field", "name", 7],
		requiredEmail: ["Email Field", "requiredEmail", 8],

		text: ["Text Field", "txt", 1],
		phone: ["Phone Number", "phone", 1],
		textArea: ["Text Area", "txtArea", 1],
		email: ["Email Address Field", "email", 1],
		checkBox: ["Check Box", "check", 2],
		selectBox: ["Select Field", "select", 2],
		radioButtons: ["Radio Buttons", "radio", 2],
		terms: ["Terms & Condition", "terms", 3],
		staticText: ["Static Text", "staticText", 4],

		checkBox_fee: ["Check Box (with fee)", "check_fee", 6],
		selectBox_fee: ["Select Field (with fee)", "select_fee", 6],
		radioButtons_fee: ["Radio Buttons (with fee)", "radio_fee", 6],
		duplicateCnt: ['Duplicate Container', 'duplicate_cnt', 9]
	};

	this.generateFieldJSON = function(id, type, name, fieldorder, label, required, options, charegableInputs, size, duplicate) {
		var isValid = false;
		for (var opt in EbpFormsAdminBuilder.sizeOptions){
			if (EbpFormsAdminBuilder.sizeOptions[opt].val == size) {
				isValid = true;
			}
		}
		if (!isValid) size = EbpFormsAdminBuilder.sizeOptions[0].val;

		if (!duplicate) duplicate = "false"


		var json = {
			id: id,
			type: type,
			name: name,
			fieldorder: fieldorder,
			label: label,
			required: required,
			options: options,
			size: size,
			duplicate: duplicate
		};

		if (charegableInputs !== null) json.charegableInputs = charegableInputs

		return json
	}

}

var EbpFormsAdminBuilder = new function() {
	this.sizeOptions = [
		{val: 'full', label: 'Full width'},
		{val: 'half', label: 'Half width'}
	];

	this.getSizeOption = function () {
		var optionHtml = '<select name="size">';

		var isSelected;

		for(var opt in this.sizeOptions){
			isSelected = (this.sizeOptions[opt].val == inputFieldObj.size) ? 'selected="selected"' : '';
			optionHtml += '<option value="' + this.sizeOptions[opt].val + '" ' + isSelected + '>' + this.sizeOptions[opt].label + '</option>';
		}

		optionHtml += '</select>';


		return '<div class="option"><span>Width:</span>' + optionHtml + '</div>';
	}

	this.getDuplicate = function(duplicate) {
		var duplicateChecked = (duplicate == "true") ? "checked" : '';

		return '<div class="option"><span>Duplicate:</span><input type="checkbox" value="true" name="duplicate" ' + duplicateChecked + '/><a href="#" style="margin-left:10px;" class="tip-above tooltip" data-tip="Duplicates the field on quantity. Ex: when quantity is 3, this field is shown 3 times">?</a></div>';
	}

	this.getLanguagedText = function (obj, code) {
		if (code === undefined) code = 'default';
		var tempObj=obj.replace(/\\/g, '');
		obj = JSON.stringify(tempObj);
		var json = JSON.parse(obj);

		return (json.hasOwnProperty(code)) ? json[code].replace(/\\/g, '') : "";
	}

	this.addLanguageInput = function (json, code, name, image) {
    var img = (image != "") ? '<img src="' + image + '" />   ' : '';
     var html = '<div class="langaugedInput">';
     html += img;
     html += '<input type="text" value="' + this.getLanguagedText(json, code) + '" name="' + code + '" placeholder="' + name + ' translation"/>';
     html += '</div>';

     return html;
  };

  this.addItemHTML = function (data, obj, hasPrice, itemPrice) {
		var item = '<div class="input_item">';
		item += '<input type="text" name="itemName" value="' + this.getLanguagedText(obj)  + '" placeholder="option name" />';

		if (hasPrice) item += '<input name="itemCost" type="number" min="0" value="' + itemPrice + '"  placeholder="cost"/>';

		item += '<a href="#" class="close item_close_btn">x</a>';

		if (data.hasWPML) {
			item += '<div class="translationsCnt hiddenCnt">';
				item += '<a href="#">&#9658</a>';
				item += '<div class="translationsCntInputs">';
				for (var property in data.languages) {
	        if (data.languages.hasOwnProperty(property)) {
	          var language = data.languages[property];
	          item += this.addLanguageInput(obj, language.code, language.translated_name, language.country_flag_url);
	        }
	      }
      item += '</div>';
      item += '</div>';
		}

		item += '</div>';
		return item;
	}

	this.getTranslationSection = function (data, obj) {
		var inputHtml = "";
		if (data.hasWPML) {
			inputHtml += '<div class="translationsCnt hiddenCnt">';
				inputHtml += '<a href="#">&#9658</a>';
				inputHtml += '<div class="translationsCntInputs">';
				for (var property in data.languages) {
	        if (data.languages.hasOwnProperty(property)) {
	          var language = data.languages[property];
	          inputHtml += this.addLanguageInput(obj, language.code, language.translated_name, language.country_flag_url);
	        }
	      }
      inputHtml += '</div>';
      inputHtml += '</div>';
		}
		return inputHtml;
	}


	this.getInputField = function (data, name, label, isJson, obj, tooltip) {
		var inputHtml = "";

		if (isJson) {
			inputHtml = '<div class="option">';
			inputHtml += '<span>' + label + ':</span>';
			inputHtml += '<input type="text" value="' + this.getLanguagedText(obj) + '" name="' + name + '" />';
			if (tooltip) {
				inputHtml += '<a href="#" class="tip-below tooltip" data-tip="' + tooltip + '">?</a>';
			}

			inputHtml += this.getTranslationSection(data, obj);


			inputHtml += '</div>';
		} else {
			inputHtml ='<div class="option"><span>' + label + ':</span><input type="text" value="' + obj.replace(/\\/g, '') + '" name="' + name + '" /></div>';
			if (tooltip) {
				inputHtml += '<a href="#" class="tip-below tooltip" data-tip="' + tooltip + '">?</a>';
			}
		}

		return inputHtml;
	};

	this.getField = function (data, id, type, isOpen, inputFieldObj, hasCharegableInputs) {
		// defaults
		if (!inputFieldObj.id) inputFieldObj.id = "";
		if (!inputFieldObj.type) inputFieldObj.type = "";
		if (!inputFieldObj.fieldorder) inputFieldObj.fieldorder = "";
		if (!inputFieldObj.name) inputFieldObj.name = "";
		if (!inputFieldObj.label) inputFieldObj.label = "";
		if (!inputFieldObj.required) inputFieldObj.required = "false";
		if (!inputFieldObj.options) inputFieldObj.options = "";
		if (!inputFieldObj.prices) inputFieldObj.prices = "";
		if (!inputFieldObj.feeType) inputFieldObj.feeType = "";
		if (!inputFieldObj.size) inputFieldObj.size = 'full';
		if (!inputFieldObj.duplicate) inputFieldObj.duplicate = 'false';

		var show = (!isOpen) ? 'style="display:none;"' : '';

		var html = '<div class="fieldCnt" data-type="' + type[1] + '" data-id="' + id + '">';
		html += '<div class="header"><h3>' + type[0];

		if (type[2] != 7 && type[2] != 8) {
			html += '<div class="toggle delete">x</div>';
		}

		html += '</h3></div>';
		html += '<div class="cnt" ' + show + '><form>';

		if (type[2] == 9 ) {
			// duplicate field
			html += 'All your duplicated fields will be positioned at this level. Fields order will still be respected. It is recommended to add group all none duplicated fields together.';
		} else if (type[2] == 7 ) {
		  // NAME
			html += '<div class="splitNameCnt">';
				var checked = (data.splitName =='true')?'checked': '';
				html += '<input type="checkbox" id="splitName" ' + checked + '><label for="splitName">Split name field into 2 fields (firstname and lastname)</label>';

				var show = (data.splitName == 'true') ? '': 'style="display:none"';
				var showFullName = (data.splitName == 'false') ? '': 'style="display:none"'

				html += '<div class="namePlaceHolders" ' + show + '><em>First name</em> placeholder: <input type="text" id="firstNameTxt" placeholder="First Name placeholder text" value="' + this.getLanguagedText(data.firstNameTxt) + '">' + this.getTranslationSection(data, data.firstNameTxt) + '</div>';
				html += '<div class="namePlaceHolders" ' + show + '><em>Last name</em> placeholder: <input type="text" id="lastNameTxt" placeholder="Last Name placeholder text" value="' + this.getLanguagedText(data.lastNameTxt) + '">' + this.getTranslationSection(data, data.lastNameTxt) + '</div>';


			html += '<div class="fullNameHolder "' + showFullName +'><span><em>Full name</em> placeholder:</span><input type="text" value="' + this.getLanguagedText(inputFieldObj.options) + '" id="placeholder" name="placeholder" />' + this.getTranslationSection(data, data.firstNameTxt) + '</div>';

			html += this.getDuplicate(inputFieldObj.duplicate);

			html += '</div>';

		} else if (type[2] == 8) {
			// REQUIRED EMAIL
			html += this.getInputField(data, 'placeholder', 'Placeholder text', true, inputFieldObj.options);
			html += this.getDuplicate(inputFieldObj.duplicate);

		} else if (type[2] == 3) {
			// TERMS AND CONDITIONS
			html += this.getInputField(data, 'textToDisplay', 'Text to display', true, inputFieldObj.name);
			html += this.getInputField(data, 'link', 'Links to Terms & Conditions', false, inputFieldObj.label);

		} else if (type[2] == 4) {
			// STATIC TEXT
			html += this.getInputField(data, 'textToDisplay', 'Text', true, inputFieldObj.name);

			if (!inputFieldObj.label) inputFieldObj.label = 16;
			html += '<div class="option"><span>Font size:</span><input type="number" value="' + inputFieldObj.label + '" name="fontSize" /></div>';

			// add size field
			html += this.getSizeOption();

			html += this.getDuplicate(inputFieldObj.duplicate);

		} else {

			html += '<div class="option"><span>name*:</span><input type="text" value="' + inputFieldObj.name.replace(/\\/g, '') + '" name="name" /><a href="#" class="tip-below tooltip" data-tip="This is for your own reference! Must be unique.">?</a></div>';

			html += this.getInputField(data, 'label', 'Label', true, inputFieldObj.label, "Text to show beside a field");


			if (type[2] == 1){
				html += this.getInputField(data, 'placeholder', 'PlaceHolder text', true, inputFieldObj.options);
			} else {
				var isFeeable = type[2] == 6 && hasCharegableInputs;
				var dataIsFeeable = (isFeeable) ? ' data-feeable="true" ' : '';

				html += '<div class="option itemCnt" ' + dataIsFeeable + '>';
					html += '<span>options:</span>';

					var itemsObj = JSON.parse(inputFieldObj.options);

					inputFieldObj.prices = inputFieldObj.prices.trim().replace(/(\r\n|\n|\r)/gm, " ");
					var itemsCost = (isFeeable && inputFieldObj.prices) ? inputFieldObj.prices.split(';') : [];

					var itemCost;
					for (var i = 0; i < itemsObj.length; i++) {
						itemCost = parseInt(itemsCost[i]);
						if (!itemCost || itemCost < 1) itemCost = 0;

						html += this.addItemHTML(data, itemsObj[i], isFeeable, itemCost)
					}

				html += '<a href="#" class="add_option_item" ' + dataIsFeeable + '>Add option</a>';
				html += '</div>'

			}

			var requiredChecked = (inputFieldObj.required == "true") ? "checked" : '';
			html += '<div class="option"><span>Required:</span><input type="checkbox" value="true" name="required" ' + requiredChecked + '/></div>';

			if (type[2] == 6 && hasCharegableInputs) {
				var feeTypeIsOnce = 'checked="checked"';
				var feeTypeIsTicket = '';

				if (inputFieldObj.feeType == 'ticket') {
					feeTypeIsTicket = feeTypeIsOnce;
					feeTypeIsOnce = '';
				}

				html += '<div class="option padded"><span>Fee type:</span>';
					html += '<input type="radio" value="once"  name="feeType"  ' + feeTypeIsOnce + '> Once';
					html += '<input style="margin-left: 5px;" type="radio" value="ticket" name="feeType" ' + feeTypeIsTicket + '> Per ticket';

					html += '<a href="#" style="margin-left:10px;" class="tip-above tooltip" data-tip="\'Once\' will charge the amount once without taking number of tickets into consideration. \'Per ticket\' will multiple amount of option by quantity booked. ">?</a>';
				html += '</div>';
			}

			// add size field
			html += this.getSizeOption();

			//duplicate
			html += this.getDuplicate(inputFieldObj.duplicate);
		}


		html += '</form></div>';
		html += '</div>';

		return html;
	}

	this.getFormEditSection = function (data, hasCharegableInputs) {
		console.log(data);
		html = '<form id="formDetails" class="formDetails" method="post">'

		html += '<div class="head"><span>Name: </span><input id="name" name="name" value="' + data.name.replace(/\\/g, '') + '" type="text"  /></div>'
		html += '</div>'

		html += '<div class="formElements">';
		html += "<h2>Form Fields:</h2>";

		html += '<div class="formFields">';

		var fields = data.fields;

		var hasDuplicateCnt = false;
		var Type;
		for (var i = 0; i < fields.length; i++ ) {
			inputFieldObj = fields[i];
			switch(inputFieldObj.type) {
				case "name":
					Type = EbpFormsAdminModel.FieldTypes.name;
					break
				case "phone":
					Type = EbpFormsAdminModel.FieldTypes.phone;
					break;
				case "requiredEmail":
					Type = EbpFormsAdminModel.FieldTypes.requiredEmail;
					break
				case "txt":
					Type = EbpFormsAdminModel.FieldTypes.text;
					break
				case "txtArea":
					Type = EbpFormsAdminModel.FieldTypes.textArea;
					break
				case "email":
					Type = EbpFormsAdminModel.FieldTypes.email;
					break
				case "check":
					Type = EbpFormsAdminModel.FieldTypes.checkBox;
					break
				case "select":
					Type = EbpFormsAdminModel.FieldTypes.selectBox;
					break
				case "radio":
					Type = EbpFormsAdminModel.FieldTypes.radioButtons;
					break;
				case "terms":
					Type = EbpFormsAdminModel.FieldTypes.terms;
					break;
				case "staticText":
					Type = EbpFormsAdminModel.FieldTypes.staticText;
					break;

				case "check_fee":
					Type = EbpFormsAdminModel.FieldTypes.checkBox_fee;
					break
				case "select_fee":
					Type = EbpFormsAdminModel.FieldTypes.selectBox_fee;
					break
				case "radio_fee":
					Type = EbpFormsAdminModel.FieldTypes.radioButtons_fee;
					break;
				case "duplicate_cnt":
				 Type = EbpFormsAdminModel.FieldTypes.duplicateCnt;
				 hasDuplicateCnt = true;
				 break;
			}

			html += EbpFormsAdminBuilder.getField(data, inputFieldObj.id, Type, false, inputFieldObj, hasCharegableInputs);
		}

		//
		html +=  '</div>';

		html +=  '<div class="btns">';
			html += '<a href="#" class="addField">Add new field</a>';

			if (hasCharegableInputs) {
				html += '<a href="#" class="addField fee">Add new fee-able field</a>';
			}

			if (!hasDuplicateCnt) {
				html += '<a href="#" class="addField addDuplicateCnt addDuplicateCntRelated">Add duplicate position</a>';
				html += '<a href="#" class="addDuplicateCntRelated" style="margin-left:10px;" class="tip-above tooltip" data-tip="Default position of duplicate container is at the end of the form before terms & conditions field if found.">?</a>'
			}

		html += '</div>';

		html += '</div>';

		html += ' <div class="btns"><a href="#" class="btn btn-small btn-success btn-save">Save</a><a href="#" class="btn btn-small btn-duplicate btn-primary">Duplicate</a> <a href="#" class="btn btn-small btn-danger btn-delete">Delete</a></div>'
		html += ' </form><br class="ev-clear"/>'

		return html;
	}
}

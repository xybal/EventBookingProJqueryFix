/* Event Booking Pro - WordPress Plugin
 * Form Manager Addon
 * Get plugin at: http://iplusstd.com/item/eventBookingPro/
 * Author Moe Haydar
 */


(function($){
	$(document).ready(function(){
		var data = null;
	
		$(document).on('click',".formsList li a",function(e) {
			formBtnClicked($(this))
	  });
	
		// add
		$(document).on('click','#newForm',function(e){
			e.preventDefault();
			var newId = Number($("#maxFormID").val()) + 1;
			$("#maxFormID").val(newId);
			var html = '<li id="form_' + newId + '"><a href="#" data-id="' + newId + '" class="btnE btn-block "><span>Form Name</span></a></li>';
			$(".formsList li a.active").removeClass("active");
			$('.formsList').append(html);
			$("#form_" + newId).find("a").addClass("active");
	
			$(document).on('click',".formsList li:last-child a",function(e) {
				formBtnClicked($(this))
			});
	
			// move to backend
			data = {
				id: newId,
				name : "Form Name",
				fields: "",
				splitName: "false",
				firstNameTxt: '{"default": "First Name"}',
				lastNameTxt: '{"default": "Last Name"}',
				fields:  [
					{
						id: '-1',
						name: 'name',
						type: 'name',
						label: 'name',
						fieldorder: 1,
						required: true,
						options: '{"default": "First Name"}'
					},
					{
						id: '-1',
						name: 'requiredEmail',
						type: 'requiredEmail',
						label: 'requiredEmail',
						fieldorder: 2,
						required: true,
						options: '{"default": "Email Address"}'
					}
				]
	
			};
	
	
			prepareDetails(newId, false);
		});
	
		function formBtnClicked($which){
			$(".formsList li a.active").removeClass("active");
			$which.addClass("active");
			getDetails($which.attr("data-id"));
		}
	
		function getDetails(id){
			prepareDetails(id, true)
		}
	
		function prepareDetails(id, load){
			var html = '<input type="hidden" id="formID" value="' + id + '"/>';
			$('.formsDetailsCnt .cnt').html(html);
	
			if(load) {
				getFormDetails();
			} else {
				getFormEditsSection(id);
				saveForm();
			}
		}
	
		var hasCharegableInputs = $('#hasCharegableInputs').val() == 'true';
	
		function getFormDetails(){
			var id = $("#formID").val();
			$('#loader').slideDown(100);
			$.ajax({
				type:'POST',
				url: 'admin-ajax.php',
				data:'action=form_fetch&id=' + id,
				success: function(response) {
					$('#loader').slideUp(100);
					data = $.parseJSON(response);
	
					getFormEditsSection(id)
				}
			});
		}
	
	
		function getFormEditsSection(id){
			var html = EbpFormsAdminBuilder.getFormEditSection(data, hasCharegableInputs);
	
			$(".formsDetailsCnt .cnt").append(html);
	
			$(document).on('click','.translationsCnt a',function(e) {
				e.preventDefault();
				var $parent = $(this).parent();
				if ($parent.hasClass("hiddenCnt")) {
					$parent.removeClass('hiddenCnt');
					$(this).html("&#9660");
				} else {
					$parent.addClass('hiddenCnt');
					$(this).html("&#9658;")
				}
			});
	
			$('#splitName').change(function() {
			if($(this).is(":checked")) {
			  $(this).parent().find('.namePlaceHolders').show();
			  $(this).parent().parent().find('.fullNameHolder').hide();
			} else {
				$(this).parent().find('.namePlaceHolders').hide();
				$(this).parent().parent().find('.fullNameHolder').show();
			}
		  });
	
	
			$( ".formFields" ).sortable({
			  connectWith: ".formFields",
			  handle: ".header"
			});
	
		}
	
		$(document).on('click','.btn-duplicate',function(e){
			e.preventDefault();
			duplicateForm($('#formDetails #name').val());
		});
	
		function duplicateForm(name){
			var newId = Number($("#maxFormID").val()) + 1;
			$("#maxFormID").val(newId);
	
				var html = '<li id="form_' + newId + '"><a href="#" data-id="' + newId + '" class="btnE btn-block "><span>Form Name</span></a></li>';
			$(".formsList li a.active").removeClass("active");
			$('.formsList').append(html);
			$("#form_" + newId).find("a").addClass("active");
	
	
			$('#formID').val(newId);
			$(".formFields .fieldCnt").each(function(index, element) {
		  $(this).attr("data-id","-1");
		});
	
			saveForm();
			window.scrollTo(0,0);
		}
	
		$(".md-content .option").on('click', function(e) {
			e.preventDefault();
	
			$( '.md-show' ).removeClass('md-show' );
			$(document).removeClass( 'md-perspective' );
	
			$('html, body').animate({
				scrollTop: $(".addField").offset().top
			}, 200);
	
			var newHtml = "";
	
			switch($(this).attr("data-type")){
				case "name":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.name, true, {"options": '{"default": ""}'}, hasCharegableInputs);
				break;
	
				case "requiredEmail":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.requiredEmail, true, {"options": '{"default": ""}'}, hasCharegableInputs);
				break;
	
				case "phone":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.phone, true, {"label" : '{"default": ""}', "options": '{"default": ""}'}, hasCharegableInputs);
				break;
	
				case "text":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.text, true, {"label" : '{"default": ""}', "options": '{"default": ""}'}, hasCharegableInputs);
				break;
	
				case "textarea":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.textArea, true, {"label" : '{"default": ""}', "options": '{"default": ""}'}, hasCharegableInputs);
				break;
	
				case "email":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.email, true, {"label" : '{"default": ""}', "options": '{"default": ""}'}, hasCharegableInputs);
				break;
	
				case "checkbox":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.checkBox, true, {"label" : '{"default": ""}', "options": '[]'}, hasCharegableInputs);
				break;
	
				case "select":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.selectBox, true, {"label" : '{"default": ""}', "options": '[]'}, hasCharegableInputs);
				break;
	
				case "radio":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.radioButtons, true, {"label" : '{"default": ""}', "options": '[]'}, hasCharegableInputs);
					break;
	
				case "terms":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.terms, true, {"name": '{"default": ""}'}, hasCharegableInputs);
					break;
	
				case "staticText":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.staticText, true, {"name": '{"default": ""}'}, hasCharegableInputs);
					break;
	
				case "checkbox_fee":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.checkBox_fee, true, {"label" : '{"default": ""}', "options": '[]'}, hasCharegableInputs);
				break;
	
				case "select_fee":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.selectBox_fee, true, {"label" : '{"default": ""}', "options": '[]'}, hasCharegableInputs);
				break;
	
				case "radio_fee":
					newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.radioButtons_fee, true, {"label" : '{"default": ""}', "options": '[]'}, hasCharegableInputs);
					break;
			}
	
			$(".formsDetailsCnt .formFields").append(newHtml);
		});
	
		$(document).on('click', ".addField",function(e) {
			e.preventDefault();
			console.log('salut');
			if ($(this).hasClass('addDuplicateCnt')) {
				e.preventDefault();
				addDuplicateCnt();
				$('.addDuplicateCntRelated').remove();
			} else if ($(this).hasClass('fee') && hasCharegableInputs) {
				openChargeableFieldChooser();
			} else {
				openFieldChooser();
			}
		});
	
		$(document).on('focus', ".formFields input",function() {
			$(this).css("border-color","#ddd");
		});
	
		$(document).on('click','.formFields .header',function(e){
			$(this).parent().find(".cnt").toggle();
		});
	
		$(document).on('click','.formFields .delete',function(e){
			$(this).parent().parent().parent().remove();
		});
	
		$(document).on('click','.btn-delete',function(e){
			e.preventDefault();
			deleteData();
		});
	
		$(document).on('click','.btn-save',function(e){
			e.preventDefault();
			saveForm();
		});
	
		
		
	
		function openFieldChooser () {
			$modal = $('#fieldChooser')
			$modal.addClass('md-show' );
			setTimeout(function() {
				$('.md-content .offlineloader').hide();
					$(document).addClass('md-perspective');
				}, 25);
		}
	
	
		function addDuplicateCnt () {
			var newHtml = EbpFormsAdminBuilder.getField(data, -1, EbpFormsAdminModel.FieldTypes.duplicateCnt, true, {});
	
			$(".formsDetailsCnt .formFields").append(newHtml);
		}
	
		$(document).on('click', '.item_close_btn', function(e) {
			e.preventDefault();
			$(this).parent().remove();
		});
	
		$(document).on('click', '.add_option_item', function(e) {
			e.preventDefault();
	
			var isfee = $(this).attr('data-feeable') == 'true';
	
			$(this).before(EbpFormsAdminBuilder.addItemHTML(data, '{"default": ""}', isfee, ''));
		});
	
	
	
		$(document).on('click', 'a.md-close', function(e) {
			e.preventDefault();
			$modal.removeClass('md-show');
			$(document).removeClass('md-perspective');
		});
	
		// fee
		function openChargeableFieldChooser () {
			$modal = $('#chargableFieldChooser')
			$modal.addClass('md-show' );
			setTimeout(function() {
				$('.md-content .offlineloader').hide();
					$(document).addClass('md-perspective');
				}, 25);
		}
	
	
	
		function deleteData(){
			var id = $("#formID").val()
			$('#loader').slideDown(100);
			$.ajax({
				type:'POST',
				url: 'admin-ajax.php',
				data:'action=form_delete&id=' + id,
				success: function(response) {
					$('#loader').slideUp(100);
				}
			});
	
			$("#form_" + id).remove();
			$(".formsDetailsCnt .cnt").empty();
		}
	
		var getTextJsonStringFromInput = function ($input) {
			var json = {
				'default': $input.val()
			}
	
			$translationsCnt = $input.parent().find('.translationsCnt');
			if ($translationsCnt.length > 0) {
				$translationsCnt.find('input[type="text"]').each(function(e) {
					var $translationInput = $(this);
					if ($(this).val() !== "") {
						json[$translationInput.attr('name')] = $translationInput.val(); 	
					}
				})
			}
	
			return JSON.stringify(json);
		}
	
		function saveForm (){
			var extras = "";
			var order = 1;
			var type, name, flag = false;
	
			var fieldsArr = [];
			$(".formFields>div").each(function(index, element) {
		  type = $(this).attr("data-type");
				name = $(this).find('input[name="name"]').val();
	
				if(name == ""){
					flag = true;
					$(this).find('input[name="name"]').css("border-color","#F00");
					alert('Please fill all required fields!');
	
					return false;
				}
	
				var id = $(this).attr('data-id');
				var label;
				var required;
				var options;
				var charegableInputs;
				var size;
				var duplicate = 'false';
	
				// set duplicate
				if ($(this).find('input[name="duplicate"]')) {
					duplicate = $(this).find('input[name="duplicate"]').is(':checked') ? 'true' : 'false';
				}
	
				// set size
				if ($(this).find('select[name="size"]')) {
					size = $(this).find('select[name="size"]').val();
				}
	
				if (type === 'duplicate_cnt') {
					name = type;
					label = type;
					required = 'true';
					options = '';
					charegableInputs = null;
					size = null;
				} else if (type === 'name' || type === 'requiredEmail') {
					name = type;
					label = type;
					required = 'true';
					options = getTextJsonStringFromInput($(this).find('input[name="placeholder"]'));
					charegableInputs = null;
					size = null;
	
				} else if (type === 'staticText') {
					name = getTextJsonStringFromInput($(this).find('input[name="textToDisplay"]'));
					label = $(this).find('input[name="fontSize"]').val();
					required = 'false';
					options = '';
					charegableInputs = null;
	
				} else	if (type === 'terms') {
					name = getTextJsonStringFromInput($(this).find('input[name="textToDisplay"]'));
					label = $(this).find('input[name="link"]').val();
					required = 'true';
					options = '';
					charegableInputs = null;
					size = "full";
	
				} else if (type === 'email' || type === 'txt' || type === 'txtArea' || type === 'phone') {
					label = getTextJsonStringFromInput($(this).find('input[name="label"]'));
					required = $(this).find('input[name="required"]').is(':checked') ? 'true' : 'false';
					options = getTextJsonStringFromInput($(this).find('input[name="placeholder"]'));
					charegableInputs = null;
				} else {
	
					label = getTextJsonStringFromInput($(this).find('input[name="label"]'));
					required = $(this).find('input[name="required"]').is(':checked') ? 'true' : 'false';
	
					var currentItemsArr = [];
					var currentCostsArr = []
					var currCost;
					$(this).find('.itemCnt .input_item').each(function () {
						
						currCost = $(this).find('input[name="itemCost"]').val();
	
						if ($(this).find('input[name="itemName"]').val().trim() !== '') {
							if (!currCost || currCost < 0) currCost = 0;
	
							currentItemsArr.push(getTextJsonStringFromInput($(this).find('input[name="itemName"]')));
							currentCostsArr.push(currCost);
						}
					});
	
	
					currentCosts = currentCostsArr.join(";")
					options = JSON.stringify(currentItemsArr);
	
					if (hasCharegableInputs) {
						if ($(this).find('.itemCnt').attr('data-feeable') !== 'true') {
							charegableInputs = null;
						} else {
							var feeType =($(this).find('input[name="feeType"]:checked')) ? $(this).find('input[name="feeType"]:checked').val() : 'none'
							if (duplicate === 'true' && feeType == 'ticket') {
								feeType = 'once';
							}
	
							charegableInputs = {
								prices: currentCosts,
								feeType: feeType
							};
						}
	
					} else {
						charegableInputs = null;
					}
	
				}
	
				fieldsArr.push(EbpFormsAdminModel.generateFieldJSON(id, type, name, order, label, required, options, charegableInputs, size, duplicate));
				order++ ;
		});
	
	
			if (flag) return;
	
	
			$('#loader').slideDown(100);
	
			
			var id = $('#formID').val();
			var name = $('#formDetails #name').val();
	
			var splitName = ($('#formDetails #splitName').is(':checked')) ? 'true' : 'false';
			var firstNameTxt = getTextJsonStringFromInput($('#formDetails #firstNameTxt'));
			var lastNameTxt = getTextJsonStringFromInput($('#formDetails #lastNameTxt'));
	
			$.ajax({
				type:'POST',
				url: 'admin-ajax.php',
				data:'action=ebp_form_save&id='  + id + '&name=' + encodeURIComponent(name)+
				'&splitName=' + splitName + '&firstNameTxt=' + firstNameTxt + '&lastNameTxt=' + lastNameTxt +
				'&fields=' + encodeURIComponent(JSON.stringify(fieldsArr)),
				success: function(response) {
					$('#loader').slideUp(100);
					$("#form_" + id).find("span").html(name);
	
					var result = $.parseJSON(response);
				}
			});
		}
	})
	})(jQuery)	
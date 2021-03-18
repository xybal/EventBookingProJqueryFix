<?php

/* Event Booking Pro - WordPress Plugin
 * Form Manager Addon
 * Get plugin at: http://iplusstd.com/item/eventBookingPro/
 * Author Moe Haydar
 */


class EventBookingFormsAdmin {

	var $main, $path, $name, $url;
	function __construct($file) {
		$this->main = $file;
		$this->version = "1.971";
		$this->JS_TAG = '20170520';
		$this->init();
		return $this;
	}

	function init() {
		$this->path = dirname( __FILE__ );
		$this->name = basename( $this->path );
		$this->url = plugins_url( "/{$this->name}/" );

		$this->hasCharegableInputs = EventBookingFormsAdmin::checkForExtra(false);

		if (is_admin()) {
			register_activation_hook( $this->main , array(&$this, 'activate') );
			register_deactivation_hook($this->main , array(&$this, 'deactivate') );
			add_action('wp_ajax_ebp_form_save', array(&$this, 'saveForm'));
			add_action('wp_ajax_form_fetch', array(&$this, 'getForm'));
			add_action('wp_ajax_form_delete', array(&$this, 'deleteForm'));
			add_action('admin_menu', array(&$this, 'admin_menu'));
		} else {
			 add_action('wp', array(&$this, 'frontEndFiles'));
		}
	}

	function getTableName($name) {
		global $wpdb;

		$tables = array(
			'forms' => $wpdb->base_prefix . 'ebp_forms',
			'formsInput' => $wpdb->base_prefix . 'ebp_forms_inputs'
		);

    return (string) $tables[$name];
  }

	function deactivate(){
		update_option("ev_uses_form", "0");
	}

	function activate() {
		global $wpdb;
		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

		$formsTable = $this->getTableName("forms");
		$formsTable_sql = "CREATE TABLE " . $formsTable ." (
					  id INT NOT NULL AUTO_INCREMENT,
					  name varchar(100) NOT NULL,
					  splitName varchar(7) default 'false',
					  firstNameTxt TEXT NOT NULL,
					  lastNameTxt TEXT NOT NULL,
					  PRIMARY KEY (id)
					);";


		$formsInputTable = $this->getTableName("formsInput");
		$formsInput_sql = "CREATE TABLE " . $formsInputTable ." (
					  id INT NOT NULL AUTO_INCREMENT,
					  form INT NOT NULL,
					  type varchar(100) NOT NULL,
					  name varchar(255) default '',
					  fieldorder int NOT NULL,
					  label TEXT,
					  required varchar(6) default 'false',
					  options TEXT,
					  prices TEXT,
					  feeType varchar(10) default 'none',
					  size varchar(10) default 'full',
					  duplicate varchar(6) default 'false',
					  PRIMARY KEY (id)
					);";

		// feeType (once, ticket, none)
		dbDelta($formsTable_sql);
		dbDelta($formsInput_sql);

		$currVersion = floatval(get_option("ebp_forms_version"));
		if ($currVersion < 1.97) {
			$this->migrateToMultiLinguistic();
		}

		update_option("ebp_forms_version", $this->version);
		update_option("ev_uses_form", "1");
	}

	function migrateToMultiLinguistic() {
		global $wpdb;

		$results = $wpdb->get_results( "SELECT name, type, id, label, options FROM " . $this->getTableName("formsInput"));

		foreach ($results as $result) {
			if ($result->type == 'terms' || $result->type == 'staticText') {
				$data = array(
					'name' => '{"' . EbpText::DEFAULT_CODE . '": "'.$result->name.'"}'
				);
			} else if ($result->type == 'requiredEmail' || $result->type == 'name') {
				$data = array(
					'options' => '{"' . EbpText::DEFAULT_CODE . '": "'.$result->options.'"}'
				);
			} else if ($result->type == 'check' || $result->type == 'check_fee'
				 || $result->type == 'radio' || $result->type == 'radio_fee'
				 || $result->type == 'select' || $result->type == 'select_fee') {
				$options = explode(";", $result->options);
				$newOptions = array();
				foreach ($options as $option) {
					array_push($newOptions, '{"' . EbpText::DEFAULT_CODE . '": "'.$option.'"}');
				}
				$data = array(
					'label' => '{"' . EbpText::DEFAULT_CODE . '": "'.$result->label.'"}',
					'options' => json_encode($newOptions)
				);
			} else {
				$data = array(
					'label' => '{"' . EbpText::DEFAULT_CODE . '": "'.$result->label.'"}',
					'options' => '{"' . EbpText::DEFAULT_CODE . '": "'.$result->options.'"}'
				);
			}

			$wpdb->update($this->getTableName("formsInput"), $data, array('id'=>$result->id));
		}

		$results = $wpdb->get_results( "SELECT id, firstNameTxt, lastNameTxt FROM " . $this->getTableName("forms"));

		foreach ($results as $result) {
			$data = array(
				'firstNameTxt' => '{"' . EbpText::DEFAULT_CODE . '": "'.$result->firstNameTxt.'"}',
				'lastNameTxt' => '{"' . EbpText::DEFAULT_CODE . '": "'.$result->lastNameTxt.'"}'
				);

			$wpdb->update($this->getTableName("forms"), $data, array('id'=>$result->id));
		}


	}


	function admin_menu() {
		$mainMenu = add_submenu_page( 'eventManagement','Event Booking Forms Manager', 'Forms Manager', 'manage_options', 'eventManagementForms', array(&$this, 'admin_page'));
		add_action('load-'.$mainMenu, array(&$this, 'admin_menu_scripts'));
		add_action('load-'.$mainMenu, array(&$this, 'admin_menu_styles'));
	}

	function admin_menu_scripts() {
		wp_enqueue_script('ebp-forms-admin-helper-js', $this->url . 'js/adminHelper.js', array() );
		wp_enqueue_script('ebp-forms-admin-js', $this->url . 'js/admin.js', array('ebp-forms-admin-helper-js', 'jquery', 'jquery-ui-core', 'jquery-ui-sortable') );
	}

	function admin_menu_styles() {
		wp_enqueue_style( 'ebp-forms-admin-css', $this->url . 'css/admin.css' );
	}

	function frontEndFiles() {
    wp_enqueue_script('ebp-forms-phone-js', $this->url . 'js/phone/intlTelInput.min.js', 'jquery' , $this->JS_TAG, true);
		wp_enqueue_style('ebp-forms-phone-css', $this->url . 'css/phone.css', array(), $this->JS_TAG, 'all');
	}


	function deleteForm(){
		global $wpdb;
		$table_name = $this->getTableName("forms");
		$wpdb->delete($table_name, array( 'id' => $_POST['id'] ), array( '%d' ) );
		echo $_POST['id'];
		die();
	}

	function getForm(){
		global $wpdb;
		$id = $_POST['id'];
		$result = $wpdb->get_row( "SELECT * FROM " . $this->getTableName("forms")." where id='$id' ");
		$result->fields= $this->getFields($id);

		$result->languages = EbpText::getAllLanguages();
		$result->hasWPML = EbpText::hasWPML();

		if ($result != NULL) {
			echo json_encode($result);
		} else {
			echo "Error";
		}
		die();
	}

	function getFields($id){
		global $wpdb;
		$results = $wpdb->get_results( "SELECT * FROM " . $this->getTableName("formsInput")." where form='$id' order by fieldorder");

		return $results;
	}


	function saveForm() {
		global $wpdb;
		$response = array('success'=> true, 'error' => null);
		try {
			$table_name =$this->getTableName("forms");

			$id = $_POST['id'];
			$name = $_POST['name'];

			$splitName = $_POST['splitName'];
			$firstNameTxt = $_POST['firstNameTxt'];
			$lastNameTxt = $_POST['lastNameTxt'];

			$fieldsJSON = stripslashes($_POST['fields']);

			$isAvilable = $wpdb->get_var( "select COUNT(*) from " . $table_name ." where id= '$id'");

			$data = array('name'=>$name, 'splitName'=>$splitName , 'firstNameTxt'=>$firstNameTxt, 'lastNameTxt'=>$lastNameTxt);

			if ($isAvilable > 0) {
				$wpdb->update($table_name, $data, array( 'id' => $id ));
			} else {
				$data['id'] = $id;
				$wpdb->insert($table_name ,$data);
			}

			$occurIds = array();

			$fields = json_decode($fieldsJSON, true);

			foreach ($fields as $field) {
				$field_id = $this->addFormInput($id, $field);
				array_push($occurIds, $field_id);
			}

			// delete those deleted
			$results = $wpdb->get_results("SELECT * FROM " .$this->getTableName("formsInput")." where form='$id'");
			foreach($results as $result){
				if(!in_array($result->id, $occurIds))
					$wpdb->delete( $this->getTableName("formsInput"), array( 'id' => $result->id ), array( '%d' ) );
			}

		} catch (Exception $e) {
			$response =  array('success' => false, 'error' =>$e->getMessage());
		}

		echo json_encode($response);
		die();
	}

	function addFormInput($formId, $input_feild){
		global $wpdb;
		$table_name = $this->getTableName("formsInput");

		// {
		// 	id:
		// 	type:
		// 	name:
		// 	fieldorder:
		// 	label:
		// 	required:
		// 	options:

		// 	size: (full, half)
		//  duplicate: (boolean)

		// 	charegableInputs: {
		// 		prices:
		// 		feeType:
		// 	}
		// }

		// validate size
		$fieldSize = $input_feild['size'];
		if ($fieldSize != 'half') $fieldSize = 'full';

		$data = array(
			'type'=>$input_feild['type'],
			'name'=>$input_feild['name'],
			'fieldorder'=>$input_feild['fieldorder'],
			'label'=>$input_feild['label'],
			'required'=>$input_feild['required'],
			'options'=>$input_feild['options'],
			'size'=>$fieldSize,
			'duplicate'=>$input_feild['duplicate']
		);


		if (array_key_exists('charegableInputs', $input_feild)) {
			$data['prices'] = $input_feild['charegableInputs']['prices'];
			$data['feeType'] = $input_feild['charegableInputs']['feeType'];
		}

		if($input_feild['id'] != "-1"){
			$wpdb->update($table_name, $data , array("id"=>$input_feild['id']));
			$newId = $input_feild['id'];
		} else {
			$data['form'] = $formId;
			$wpdb->insert($table_name, $data);
			$newId = $wpdb->insert_id;
		}

		return $newId;
	}

	function admin_page() {
		include_once($this->path . '/pages/admin.php');
	}


	static function checkForExtra($html = true) {
		if (get_option('ev_uses_form_extra') != 1) return;

		$val = false;
		if (!class_exists("eventBookingProFormExtrasAdmin")) {

			$addonPath = dirname( __FILE__ ).'/eventBookingProFormExtras/eventBookingProFormExtrasClass.php';
			if (is_file($addonPath)) {
				require_once($addonPath);
				$val = true;
			}
		} else {
			$val = true;
		}


		if ($html && $val) {
			return eventBookingProFormExtrasAdmin::usesExtraHTML();
		} else if (!$html) {
			return $val;
		}
	}
}

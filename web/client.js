//Creating Global Values
var translatingLanguages_data,
    language_list,
    current_row_index =0,
   table,
    selected,
    langIndex=0,
    currentSelectedLanguage = 'description';
// creating the Selection Box and Give Options in List of Language From Language Json With Ajax
function fillingLanguageList(id) {
    var language_data='';
    $.each(language_list , function(key , value){
        language_data += '<option value="'+value.id+'">'+value.name+'</option>';
    });
    $('#languages').html(language_data);
}
// CheckBox  and Table Row Headers inserting in Html Table From getting Json Data From Server
function createTableHeadersAndAddData() {
    var  columnSet = [];
    var he= $('<thead/>');
    var headerTr$ = $('<tr/>');
    columnSet.push('key');
    headerTr$.append($('<th/>').html('key'));
    columnSet.push('base');
    headerTr$.append($('<th/>').html('base'));
    this.language_list.forEach(function (lang) {
        columnSet.push(lang.id);
        headerTr$.append($('<th/>').html(lang.id));
if(lang.hasKeyFlag) {
    var th$ = $('<th class="thinput"/>').html(lang.id.substring(0,2));
    columnSet.push('');
}
headerTr$.append(th$);
he.append(headerTr$);
    });
    $("#jsonTable1").append(he);
    //return columnSet;
}
// CheckBox  and Table Row data inserting in Html Table From getting Json Data From Server
function createTableRowsAndAddData (data) {
    //var columnsData=[];
    var valueJson=data.translations;
    for (var i = 0; i < valueJson.length; i++) {
        var row$ = $('<tr/>');
        row$.append($('<td/>').html(valueJson[i].key));
        row$.append($('<td/>').html(valueJson[i].base));
        //row$.append($('<td/>').html(data[i].description));
        this.language_list.forEach(function (lang) {
           // console.log("--------------------"+valueJson[i][lang.id]+"---------"+valueJson[i][lang.id+"_desc"]);
            var cellValue= ($('<td/>').html(valueJson[i][lang.id]));
            if(valueJson[i][lang.id+"_desc"]=="true"){
                var valueCheckbox ='<input type="checkbox" name="checking" class="'+lang.id+'" id="'+valueJson[i].key+'"  checked/>';
            }else{
                var valueCheckbox ='<input type="checkbox"  name="checking" class="'+lang.id+'" id="'+valueJson[i].key+'"/>';
            }
            row$.append((cellValue));
            if(lang.hasKeyFlag) {
                    row$.append($('<td class="tdinput" />').html(valueCheckbox));
            }
            });
        row$.attr("id",i);
        $("#jsonTable").append(row$);
    }
}

// Row Selection and Highlighting
function highlightSelectedRow(e){
    if(selected[0])selected[0].className='';
    e.target.parentNode.className='selected';
    if (e.target.parentNode) {
        current_row_index = e.target.parentNode.rowIndex;
        updateFormDataWithCurrentLanguage();
    }
}
// adding classes and removing classes for the selected Table Row
function addingClassToTableRow(element, className) {
    var currentClassName = element.getAttribute("class");
    if (typeof currentClassName!== "undefined" && currentClassName) {
        element.setAttribute("class",currentClassName + " "+ className);
    }
    else {
        element.setAttribute("class",className);
    }
}
function removingClassFromTableRow(element, className) {
    var currentClassName = element.getAttribute("class");
    if (typeof currentClassName!== "undefined" && currentClassName) {
        var class2RemoveIndex = currentClassName.indexOf(className);
        var class2Remove = currentClassName.substr(class2RemoveIndex, className.length);
        var updatedClassName = currentClassName.replace(class2Remove,"").trim();
        element.setAttribute("class",updatedClassName);
    }
    else {
        element.removeAttribute("class");
    }
}
//change Function For One row to Another Row with Select and deselect Manner
function changingHighlightRow(e){
    var unSelected =table.getElementsByClassName('selected');
    if(unSelected.length) {
        removingClassFromTableRow(unSelected[0], 'selected');
    }
    if (current_row_index > -1) {
        var toSelect = document.getElementById(current_row_index);
        if (toSelect) {
            addingClassToTableRow(toSelect,'selected');
        }
    }
}
//Update the Table Data when Edited and Saved Table
function changeCurrentLanguage(newLang) {
    //console.log("changeCurrentLanguage()", newLang);
    currentSelectedLanguage = newLang;
    updateFormDataWithCurrentLanguage();
    var filteredCheckBox = document.getElementById('filtering').checked;
    if(filteredCheckBox) {
        FilterTableDataBasedUponCurrentLanguage();
    }
}
// Get the Selected Data From Table and Update the From Data with Selected Language Data.
function updateFormDataWithCurrentLanguage() {
    var rec = translatingLanguages_data.translations[current_row_index];
    var key = document.getElementById('key');
    var base = document.getElementById('base');
    var translation = document.getElementById('translation');
    var language = document.getElementById('language');
    key.value = rec['key'];
    base.value = rec['base'];
    language.value = currentSelectedLanguage;
    if (currentSelectedLanguage) {
        translation.value= rec[currentSelectedLanguage];
    }
}
// Update Table Value Directly on HTML Table when edit and save Data with Form
function updateTableValueWithCurrentLanguage(){
    var translation = document.getElementById('translation');
    translatingLanguages_data.translations[current_row_index][currentSelectedLanguage] = translation.value;
    var flagIndexToSkip=0;
    for(i=0;i<language_list.length;i++){
        //console.log(language_list[i].id);
        if(language_list[i].id==currentSelectedLanguage)
            langIndex=i+3+flagIndexToSkip;
        if(language_list[i].hasKeyFlag){
            flagIndexToSkip++;
        }
    }
    var selectedField=$("#jsonTable tbody .selected td:nth-child("+langIndex+")");
    selectedField.text(translation.value);
}
//filtering The Data Based Upon the selected Language with Ajax Services
function FilterTableDataBasedUponCurrentLanguage(event) {
    var filteredCheckBox = document.getElementById('filtering').checked;
    if (filteredCheckBox) {
        var lang=document.getElementById("languages").selectedIndex;
        var langValue=(document.getElementsByTagName("option")[lang].label);
        $('#ll').html(langValue).css('color','#2196F3');
        $("#jsonTable").find("tr").remove();
        $.getJSON('/all-translations', function (tableData) {
            var newjson = {translations: []};
            var  filtered_translate_data = tableData.translations;
            filtered_translate_data.forEach(function (element, index) {
                if(!element[currentSelectedLanguage]){
               // if (element[currentSelectedLanguage] === null || element[currentSelectedLanguage] === ''|| element[currentSelectedLanguage] ===undefined) {
                    //console.log('found', element);
                    newjson.translations.push(element);
                }
            });
            translatingLanguages_data = newjson;
            createTableRowsAndAddData(newjson);
            changingHighlightRow();
            updateFormDataWithCurrentLanguage();
        });
    } else {
        $("#jsonTable").find("tr").remove();
        $('#ll').html('Filters Are Off').css('color','#404040');
        $.getJSON('/all-translations', function (tableData) {
            var unFilteredData = tableData;
            translatingLanguages_data = unFilteredData;
            createTableRowsAndAddData(unFilteredData);
            changingHighlightRow();
            updateFormDataWithCurrentLanguage();
        });
    }
};
// Table KeyBoard Events Up and Down Function to Select the Data.
function ArrowUpAndDownKeyEvents(e) {
    if (e.key == 'ArrowDown') {
        if (current_row_index < translatingLanguages_data.translations.length-1) {
            ++current_row_index;
            changingHighlightRow();
            updateFormDataWithCurrentLanguage();
        }else {
            e.preventDefault();
        }
    }
    else if (e.key == 'ArrowUp') {
        if (current_row_index > 0) {
            --current_row_index;
            changingHighlightRow();
            updateFormDataWithCurrentLanguage();
        }else{
            e.preventDefault();
        }
        // down arrow
    }
    else if (e.keyCode == '37') {
        // left arrow
    }
    else if (e.keyCode == '39') {
        // right arrow
    }
}
//Adding KeyBoard Events to table to move Up and Down with Highlighted Row
document.addEventListener('keydown', function(event){
    var clicked = event.target;
    if (clicked.id != 'languages') {
        document.body.addEventListener('keydown',  ArrowUpAndDownKeyEvents, false);
    } else {
        event.preventDefault();
    }
});
//Adding the Events to the when and Where Update the Language CheckBox
document.addEventListener("click", function(event){
    var clicked = event.target;
    var clickedAttr=clicked.getAttribute("name");
    if(clickedAttr === 'checking') {
        var key = clicked.id;
        var lang = clicked.className;
        var value = clicked.checked;

        updateCheckBoxValue(key, lang, value);
    }
});
//checkBox Update with True/false Save Data in Description Each Language File
function  updateCheckBoxValue(key , lang , value ) {
    $.ajax({
        type: "POST",
        url: "/updateKeyFlagLang",
        data: {"key" : key,"language" : lang ,"keyflag" : value},
        success: function(data){
            // console.log(data);
            if(data.error== false) {
                successOrErrorMessagePopUp("snackbar1","snackbar1");
            }else{
                successOrErrorMessagePopUp("snackbar2","snackbar2");
            }
        },
        error:function(data){
            successOrErrorMessagePopUp("snackbar4","snackbar4");
            //manage the error
        },
        dataType: "json"
    });
}
//Getting Languages Related Data and append to the Table with Ajax GET Services.
document.addEventListener("DOMContentLoaded", function() {
    $.getJSON("/languages", function (data) {
        language_list = data;
        $.getJSON('/all-translations', function (tableData) {
    translatingLanguages_data = tableData;
     createTableHeadersAndAddData();
            fillingLanguageList();
            createTableRowsAndAddData(translatingLanguages_data);
                table = document.getElementById('jsonTable');
               selected = table.getElementsByClassName('selected');
                table.onclick = function (e) {
                    var clicked = e.target;
                    if (clicked.parentNode) {
                        if (clicked.parentNode.rowIndex !== undefined) {
                            current_row_index = (clicked.parentNode.rowIndex);
                        } else {
                            current_row_index = clicked.parentNode.parentNode.rowIndex;
                        }
                        if (current_row_index + 1) {
                            updateFormDataWithCurrentLanguage();
                            changingHighlightRow();
                        }
                    }
                };
        });
    });
    // Update table Data and Send it to the Server through Ajax POST services.
    $(function() {
        $('#formUpdate').submit(function (event) {
            event.preventDefault();
            $.ajax({
                type: 'POST',
                url: '/translation',
                data: $('#formUpdate').serialize(),
                success: function (data) {
                   // console.log(data);
                    if(data.error== false){
                        updateTableValueWithCurrentLanguage();
                        successOrErrorMessagePopUp("snackbar","snackbar");
                    }else {
                        //unknown selection
                        successOrErrorMessagePopUp("snackbar0","snackbar0");
                    }
                },
                error: function (xhr, des, err) {
                    //server shutdown
                    successOrErrorMessagePopUp("snackbar3","snackbar3");
                }
            });
        });
    });
});

 //move Updated data to BackUp file Each Action Performed
$(function(){
    $('#button1').click(function(){
        $.ajax({
            type:"GET",
            url:"/moveLangFile",
            data: "{}",
            success:function(data){
                if(data.error== false) {
                    successOrErrorMessagePopUp("snackbar5","snackbar5");
                }else{
                    successOrErrorMessagePopUp("snackbar6","snackbar6");
                   // console.log(data.message);
                }
            },
            error:function(data){
                successOrErrorMessagePopUp("snackbar3","snackbar3");
            }
        })
    })
});

//show Popup when Data Save and Show any Errors Occurs
function successOrErrorMessagePopUp(snackbar){
    var snack2 = document.getElementById(snackbar);
    snack2.className = "show";
    setTimeout(function(){ snack2.className = snack2.className.replace("show", " "); }, 2500);
}
//Ajax Loading when Start and Finish
$(document).ajaxStart(function(){
        $("#wait").css("display", "block");
        //$("#wait").show();
    },3000);
    $(document).ajaxComplete(function(){
        $("#wait").css("display", "none");
        //$("#wait").hide();
    },3000);




document.addEventListener('DOMContentLoaded', function(){ 
        document.body.insertAdjacentHTML('afterbegin', '<s id="toggle-comment-mode" class="not-selectable" style="opacity: 0.6; display: block; position: fixed; background-color: gray; width: 100px; height: 40px; text-decoration: none; color: white; font-size: 1.2em; cursor: pointer; text-align: center; line-height: 38px;">Toggle</s>');
        
        var onmouseenter = function(){
                $(this).addClass('intro').css('box-shadow', 'inset 0 0 5px blue, 0 0 5px red').css('cursor', 'crosshair');
            }
        var onmouseout = function(){
                $(this).removeClass('intro').css('box-shadow', 'none');
            }
        var onclick = function(event){
                var element = event.target;
                $('*').removeAttr('data-intro');
                if(commentMode == 'add-comment'){
                    addComment(element, event);
                }else{
                    addStep(element, event);
                }
        }
        
        function addStep(element, event){
            $(element).attr('data-intro','');
            onElementsHighlightMode();
            intro.start();
            $('.introjs-helperNumberLayer').html(parseInt(currentStep) + 1);
            
            //adding textarea
            $('.introjs-tooltiptext').html($('<textarea>').attr('id', 'comment-textarea').attr('rows', 3).focus());
            if(currentStep == 0){
                $('.introjs-tooltiptext').append(generatePathSelector());
            }
            
            //Done button event
            $('.introjs-skipbutton').on('click', function(e){
                comment = $(this).parent().parent().find('textarea').val();
                var pathes = []; 
                pathes = getPathes(this, pathes);
                var firstStep = comments.filter(function (comment) { return comment.stepNumber == '1' });
                if(firstStep.length){
                    pathes = ["fullURL"];
                }
                currentStep++;
                if(saveComment(element, comment, pathes)){
                    
                }
            });
            
            $(element).removeAttr('data-intro');
            offElementsHighlightMode();
            event.preventDefault();
            return false;
        }
        
        function addComment(element, event){
            $(element).attr('data-intro','');
            onElementsHighlightMode();
            intro.start();
            $('.introjs-helperNumberLayer').remove();
            
            //adding textarea
            $('.introjs-tooltiptext').html($('<textarea>').attr('id', 'comment-textarea').attr('rows', 3).focus());
            $('.introjs-tooltiptext').append(generatePathSelector());

            $('.introjs-skipbutton').on('click', function(e){
                comment = $(this).parent().parent().find('textarea').val();
                var pathes = [];
                pathes = getPathes(this, pathes);
                saveComment(element, comment, pathes);
            });
            $(element).removeAttr('data-intro');
            offElementsHighlightMode();
            event.preventDefault();
            return false;
        }
        
        function onElementsHighlightMode(){
            $("body *").not(".not-selectable").on('mouseenter', onmouseenter);
            $("body *").not(".not-selectable").on('mouseout', onmouseout);
            $("body *").not(".not-selectable").on('click', onclick);
        }
        
        function offElementsHighlightMode(){
            $("body *").not(".not-selectable").off( "onmouseenter", onmouseenter );
            $("body *").not(".not-selectable").off( "onmouseout", onmouseout );
            $("body *").not(".not-selectable").off( "click", onclick );
        }
        
        var currentStep = 0;
        var commentMode = '';
        var showCommentsModeFlag = false;
        var librariesLoadedFlag = false;
        var comments = [];
        var intro = '';
        if (!location.origin) location.origin = location.protocol + "//" + location.host;
        
        var toggleButton = document.getElementById('toggle-comment-mode');
        
        toggleButton.addEventListener('click', function(){
            loadLibraries();
            if(librariesLoadedFlag){
                toggleCommentsMode();
            }else{
                onLibrariesAvailable(toggleCommentsMode);
            }
        });
        

        function onLibrariesAvailable(oCallback) {
            if (typeof(eval('jQuery')) === 'function' && typeof(eval('$().sortable')) === 'function') {
                librariesLoadedFlag = true;
                oCallback();
            } else {
            setTimeout(function () {
                onLibrariesAvailable(oCallback);
            }), 50
            }
        }

        
        function toggleCommentsMode(){
            if (window.jQuery) {
                $.ajax({
                    method: "POST",
                    url: "http://oldtimers.me/server.php?action=getComments",
                    data: {
                        'baseURL' :  location.origin
                    }
                })
                .done(function( result ) {
                    comments = JSON.parse(result);
                    intro = introJs();
                    intro.onexit(offElementsHighlightMode);

                    if(!showCommentsModeFlag){
                        //Add comment button
                        $('#toggle-comment-mode').after($('<s>').text('Add comment').attr('id', 'add-comment').addClass('not-selectable').addClass('toggle-menu-block toggle-menu-add-comment'));
                        //Add step button
                        $('#toggle-comment-mode').after($('<s>').text('Add guide step').attr('id', 'add-step').addClass('not-selectable').addClass('toggle-menu-block toggle-menu-add-step'));
                        //Run guide button
                        $('#toggle-comment-mode').after($('<s>').text('Run guide').attr('id', 'run-guide').addClass('not-selectable').addClass('toggle-menu-block toggle-menu-run-guide'));
                        //Guide steps list
                        $('#toggle-comment-mode').after($('<ul>').attr('id', 'guide-steps').addClass('not-selectable').addClass('toggle-menu-block toggle-menu-step-list'));
                        
                        $('body').on('click', '#add-comment, #add-step',  function(){
                            onElementsHighlightMode();
                            commentMode = $(this).attr('id');
                        });
                        
                        $('body').on('click', '#run-guide',  function(){
                            offElementsHighlightMode();
                            intro.start();
                        });
                        
                        addHints(comments);
                        initJquerySortable();
                        intro.refresh();
                        
                        showCommentsModeFlag = true;
                    }else{
                        $('.introjs-hints, #add-comment, #add-step, #run-guide, #guide-steps').remove();
                        offElementsHighlightMode();
                        showCommentsModeFlag = false;
                    }
                });
            }
        }
      
        function loadLibraries(){
            var jQuery = document.createElement('script'); 
            jQuery.type = 'text/javascript';
            jQuery.id = 'jQuery';
            jQuery.async = true;
            jQuery.src = 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js';
            document.head.appendChild(jQuery);
            
            var commentLayoutCSS = document.createElement('link');
            commentLayoutCSS.rel = 'stylesheet';
            commentLayoutCSS.id = 'commentLayoutCSS';
            commentLayoutCSS.async = true;
            commentLayoutCSS.href = 'http://oldtimers.me/comment-layout.css';
            document.head.appendChild(commentLayoutCSS);
            
            var introJS = document.createElement('script');
            introJS.type = 'text/javascript';
            introJS.id = 'introJS';
            introJS.async = true;
            introJS.src = 'http://oldtimers.me/intro.js';
            document.head.appendChild(introJS);
            
            var introJSCSS = document.createElement('link');
            introJSCSS.rel = 'stylesheet';
            introJSCSS.id = 'introJSCSS';
            introJSCSS.async = true;
            introJSCSS.href = 'http://oldtimers.me/introjs.css';
            document.head.appendChild(introJSCSS);

            var htmlSortable = document.createElement('script');
            htmlSortable.type = 'text/javascript';
            htmlSortable.id = 'htmlSortable';
            htmlSortable.async = true;
            htmlSortable.src = 'http://oldtimers.me/html.sortable.js';
            document.head.appendChild(htmlSortable);
        }
        
        function saveComment(element, comment, pathes){
            var selector = generate(element);
            var counter = comments.length;
            var data = {
                    'id' : counter,
                    'comment' : comment,
                    'namespace' :  JSON.stringify(pathes),
                    'baseURL' :  location.origin,
                    'position' : 'left',
                    'elementPath' : selector,
                    'stepNumber' : 0
                };
            
            if(commentMode === 'add-step'){
                data.stepNumber = currentStep;
            }
            
            $(element).removeAttr('data-intro');
            
            $.ajax({
                method: "POST",
                url: "http://oldtimers.me/server.php?action=saveComment",
                data: data
            })
            .fail(function() {
                currentStep--;
                return false;
            })
            .done(function( html ) {
                comments.push(data);
                addHints(comments);
                initJquerySortable();
                onElementsHighlightMode();
                return true;
            });
            
            return false;
        }
        
        function fillInStepsList(stepsList){
            stepsList.sort(function(a, b) {
                return a['stepNumber'] - b['stepNumber'];
            });
            $(stepsList).each(function(key, value){
              //fill in steps list
                var node = document.createElement('li');
                var textnode = document.createTextNode('Guide Step: ' + value.comment);
                node.className = 'not-selectable';
                node.setAttribute('data-step-id', value.id);
                node.appendChild(textnode);
                document.getElementById('guide-steps').appendChild(node);   
            });
        }
        
        function addHints(comments){
            var hints = new Array();
            var stepsList = new Array();
            document.getElementById('guide-steps').innerHTML = "";
            
            $(comments).each(function(key, value){
                var element = document.querySelector(value.elementPath);
                value.isGuide = false;
                
                //if it's guide step
                if(typeof value.stepNumber !== 'undefined' && value.stepNumber > 0){
                   element.setAttribute('data-step', value.stepNumber);
                   element.setAttribute('data-intro', value.comment);
                   currentStep = currentStep < value.stepNumber ? value.stepNumber : currentStep;
                   value.isGuide = true;
                   
                   //show guide buttons and steps list
                   document.getElementById('run-guide').style.display = 'block';
                   document.getElementById('guide-steps').style.display = 'block';
                   
                   stepsList.push({'comment' : value.comment, 'id' : value.id, 'stepNumber' : value.stepNumber})
                }
                
                if($.inArray('fullURL', JSON.parse(value.namespace)) > -1){
                    hints.push({
                        element: element,
                        hint: value.comment,
                        hintPosition: value.position,
                        isGuide : value.isGuide
                    });
                }else{
                    var pathArray = window.location.pathname.split( '/' );
                    var pathes = new Array();
                    var path = '';
                    $(pathArray).each(function(path_key, path_value){
                        if(path_value.length){
                            path = path + '/' + path_value;
                            pathes.push(path);
                        }
                    });
                    
                    var counter = 0;
                    $(JSON.parse(value.namespace)).each(function(k, namespace){
                        if($.inArray(namespace, pathes) > -1){
                            counter++;
                        }
                    });
                    
                    if(counter > 0){
                        hints.push({
                            element: document.querySelector(value.elementPath),
                            hint: value.comment,
                            hintPosition: value.position,
                            isGuide : value.isGuide
                        });
                    }
                }
            });
            
            fillInStepsList(stepsList);
            intro.setOptions({
                'showBullets': false,
                hints: hints
                
            });
            
            intro.addHints();
            intro.refresh();
            
            //forbind to select hints in add mode
            $('.introjs-hint, .introjs-hint > *').addClass('not-selectable');
        }
        
        function initJquerySortable(stepsListUpdatingFlag) {
            $('#guide-steps').sortable({
                forcePlaceholderSize: true
            }).bind('sortupdate', function(e, ui) {
                var stepsOrder = new Array();
                $('#guide-steps > li').each(function(key, element){
                    stepsOrder.push({'id' : $(element).attr('data-step-id'), 'stepNumber' : key + 1})
                });

                $.ajax({
                    method: "POST",
                    url: "http://oldtimers.me/server.php?action=updateGuideSteps",
                    data: {
                        'data' : JSON.stringify(stepsOrder),
                        'baseURL' :  location.origin
                    }
                })
                .done(function( result ) {
                    if(result.length){
                        addHints(JSON.parse(result));
                        $('#guide-steps').sortable({forcePlaceholderSize: true});
                    }
                });
            });
        }
        
        function getPathes(element, pathes){
            $(element).parent().parent().find('select :selected').each(function(i, selected){ 
                pathes[i] = $(selected).val(); 
            });
            
            return pathes;
        }
        
        function generatePathSelector(){
            var pathSelector = $('<select>').attr('id', 'path-selector').attr('multiple', 'true').attr('name', 'path-selector');
            $(pathSelector).append($('<option>').text('Full URL').attr('value', 'fullURL'));
            var pathArray = window.location.pathname.split( '/' );
            var path = '';
            $(pathArray).each(function(key, value){
                if(value.length){
                    path = path + '/' + value;
                    $(pathSelector).append($('<option>').text(path).attr('value', path));
                }
            });
            return pathSelector;
        }
}, false);

// ------- START functions responsible for getting css selector for element ------- //
function childNodeIndexOf(parentNode, childNode) {
    var childNodes = parentNode.childNodes;
    for (var i = 0, l = childNodes.length; i < l; i++) {
        if (childNodes[i] === childNode) { return i; }
    }
}

function computedNthIndex(childElement) {
    var childNodes = childElement.parentNode.childNodes,
        tagName = childElement.tagName,
        elementsWithSameTag = 0;

    for (var i = 0, l = childNodes.length; i < l; i++) {
        if (childNodes[i] === childElement) { return elementsWithSameTag + 1; }
        if (childNodes[i].tagName === tagName) { elementsWithSameTag++; }
    }
}

function generate(node) {
    var textNodeIndex = childNodeIndexOf(node.parentNode, node),
        currentNode = node,
        tagNames = [];

    while (currentNode) {
        var tagName = currentNode.tagName;

        if (tagName) {
            var nthIndex = computedNthIndex(currentNode);
            var selector = tagName;

            if (nthIndex > 1) {
                selector += ":nth-of-type(" + nthIndex + ")";
            }

            tagNames.push(selector);
        }

        currentNode = currentNode.parentNode;
    }

    //return {selector: tagNames.reverse().join(" > ").toLowerCase(), childNodeIndex: textNodeIndex};
    return tagNames.reverse().join(" > ").toLowerCase();
}

function find(result) {
    var element = document.querySelector(result.selector);
    if (!element) { throw new Error('Unable to find element with selector: ' + result.selector); }
    return element.childNodes[result.childNodeIndex];
}
// ------- END functions responsible for getting css selector for element ------- //
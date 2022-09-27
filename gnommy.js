class Gnommy {

    textfield
    textfieldbox
    editorbox
    editorfield
    buttonbox
    footerbox
    pEnter = false

    constructor (textfield, params={}) {
        if (params.pEnter) {
            this.pEnter = true
        }
        this.textfield = this.checkTextarea(textfield)
        this.textfield.style = false
        this.createEditor()
    }

    checkTextarea (textfield) {
        if (typeof textfield == 'string') {
            textfield = document.querySelector(textfield)
        }
        if (textfield && textfield instanceof HTMLElement) {
            if (textfield.tagName.toLowerCase() !== 'textarea') {
                let textarea = document.createElement('textarea');
                textarea.setAttribute('name',textfield.getAttribute('name'))
                textarea.setAttribute('id',textfield.getAttribute('id'))
                textfield = textarea
            }
            return textfield
        }
        return false
    }

    createButton () {
        let button = document.createElement('button')
        button.classList.add('gnommy-editor-button')
        return button
    }

    fragmentWrap (wrapper,params=null) {
        let selection = null
        selection = document.getSelection();

        if (selection && selection.rangeCount > 0) {
            let selectionRange = selection.getRangeAt(0)

            if ((selection.anchorNode.parentNode.closest('.gnommy-editor-field') || selection.anchorNode.parentNode.classList.contains('gnommy-editor-field')) && selection.anchorNode.parentNode.closest('.gnommy-editor-box') === this.editorbox) {
                if(selection.focusOffset != selection.anchorOffset) {
                    let start, end
                    if (selection.anchorOffset < selection.focusOffset) {
                        start = selection.anchorOffset
                        end = selection.focusOffset
                    }
                    else {
                        start = selection.focusOffset
                        end = selection.anchorOffset
                    }
                    let startNode, endNode;
                    if (selectionRange.startOffset == selection.anchorOffset) {
                        startNode = selection.anchorNode.parentNode ?? selection.anchorNode
                        endNode = selection.focusNode.parentNode ?? selection.focusNode
                    }
                    else {
                        startNode = selection.focusNode.parentNode ?? selection.focusNode
                        endNode = selection.anchorNode.parentNode ?? selection.anchorNode
                    }
                    if (wrapper.toUpperCase() == selection.focusNode.parentNode.nodeName || (wrapper.nodeName && wrapper.nodeName == selection.focusNode.parentNode.nodeName) || wrapper.toLowerCase() == selection.anchorNode.parentNode.nodeName || (wrapper.nodeName && wrapper.nodeName == selection.anchorNode.parentNode.nodeName)) {

                        selectionRange.setStartBefore(startNode)
                        selectionRange.setEndAfter(endNode)
                        let fragment = selectionRange.extractContents()
                        selectionRange.insertNode(this.unwrap(fragment.childNodes,wrapper))
                    }
                    else {
                        let fragment = selectionRange.extractContents()
                        selectionRange.insertNode(this.wrap(fragment,wrapper,params))
                    }
                    selectionRange.collapse()
                }
            }
        }
    }

    createLinkPopup (text='',link='') {
        let self = this
        if (typeof text == 'string' && text.length > 0 && (!link || link.length == 0)) {
            if (text.slice(0,1) == '/' || text.slice(0,4).toLowerCase() == 'http') {
                link = text
            }
        }
        this.linkeditbox = document.createElement('div')
        this.linkeditbox.classList.add('gnommy-editor-linkedit-box')
        /* let linkeditContent = `
        <h4>Create link</h4>
        <label for="linktext">Text</label>
        <textarea name="linktext" id="linktext">${text}</textarea>
        <label for="linkvalue">Link</label>
        <textarea name="linkvalue" id="linkvalue">${link}</textarea>
        <div class="gnommy-editor-linkpopup-buttons">
            <button>OK</button>
            <button>Canel</button>
        </div>
        ` */
        this.linkeditTitle = document.createElement('h4')
        this.linkeditTitle.innerHTML = 'Create link'
        this.linkeditTextLabel = document.createElement('label')
        this.linkeditTextLabel.setAttribute('for','linktext')
        this.linkeditTextLabel.innerHTML = 'Text'
        this.linkeditText = document.createElement('textarea')
        this.linkeditText.name = 'linktext'
        this.linkeditText.id = 'linktext'
        this.linkeditText.value = text
        this.linkeditLinkLabel = document.createElement('label')
        this.linkeditLinkLabel.setAttribute('for','linkvalue')
        this.linkeditLinkLabel.innerHTML = 'Link'
        this.linkeditLink = document.createElement('input')
        this.linkeditLink.type = 'text'
        this.linkeditLink.name = 'linkvalue'
        this.linkeditLink.id = 'linkvalue'
        this.linkeditLink.value = link
        this.linkeditButtonBox = document.createElement('div')
        this.linkeditButtonBox.classList.add('gnommy-editor-linkpopup-buttons')
        this.linkeditOkButton = document.createElement('button')
        this.linkeditOkButton.innerHTML = 'OK'
        this.linkeditCancelButton = document.createElement('button')
        this.linkeditCancelButton.innerHTML = 'Cancel'
        this.linkeditButtonBox.append(this.linkeditOkButton,this.linkeditCancelButton)
        this.linkeditbox.append(this.linkeditTitle,this.linkeditTextLabel,this.linkeditText,this.linkeditLinkLabel,this.linkeditLink,this.linkeditButtonBox)

        this.linkeditCancelButton.addEventListener('click',function(){
            self.closePopup()
        })

        this.linkeditOkButton.addEventListener('click',function(){
            self.setLink (self.linkeditLink.value, self.linkeditText.value)
        })


        /* this.linkeditbox.insertAdjacentHTML('afterbegin',linkeditContent)
        this.linkeditText = this.linkeditbox.querySelector('#linktext')
        this.linkeditLink = this.linkeditbox.querySelector('#linkvalue') */
        return this.linkeditbox
    }

    unsetLink () {
        let selection = null
        selection = document.getSelection();

        if ((selection.anchorNode.parentNode.closest('.gnommy-editor-field') || selection.anchorNode.parentNode.classList.contains('gnommy-editor-field')) && selection.anchorNode.parentNode.closest('.gnommy-editor-box') === this.editorbox) {

            if (selection && selection.rangeCount > 0) {
                let selectionRange = selection.getRangeAt(0)
                
                let parent = selectionRange.commonAncestorContainer,
                    firstElement = selectionRange.startContainer,
                    lastElement = selectionRange.endContainer,
                    link = false,
                    fragment
                if (parent.nodeName == 'A') {
                    link = parent
                }
                else {
                    link = this.getParent(parent,'A')
                }
                if (!link) {
                    fragment = selectionRange.extractContents()
                    selectionRange.insertNode(this.unwrap(fragment.childNodes,'a'))
                    selectionRange.collapse()
                }
                else if (link.firstChild === firstElement && link.lastChild !== lastElement) {
                    selectionRange.setStartBefore(link.firstChild)
                    fragment = selectionRange.extractContents()
                    selectionRange.setStartBefore(link)
                    selectionRange.setEndBefore(link)
                    selectionRange.insertNode(fragment)
                }
                else if (link.firstChild !== firstElement && link.lastChild === lastElement) {
                    selectionRange.setStartAfter(link.lastChild)
                    fragment = selectionRange.extractContents()
                    selectionRange.setStartAfter(link)
                    selectionRange.setEndAfter(link)
                    selectionRange.insertNode(fragment)
                }
                else {
                    selectionRange.selectNode(link)
                    fragment = selectionRange.extractContents()
                    selectionRange.insertNode(this.unwrap(fragment.childNodes,'a'))
                    selectionRange.collapse()
                }
            }
        }
    }

    setLink (link, text = '') {
        if (this.isEmpty(text)) {
            text = link
        }
        if (!link || link.length == 0) {
            return false
        }

        let selection = document.getSelection();

        if (selection && selection.rangeCount > 0) {
            let selectionRange = selection.getRangeAt(0)
            
            if (this.lastRange.container && this.lastRange.container.nodeName == 'A') {
                this.lastRange.container.innerHTML = text
                this.lastRange.container.setAttribute('href',link)
                selectionRange.setEndAfter(this.lastRange.container)
                selectionRange.setStartAfter(this.lastRange.container)
                this.contentClone(this.editorfield,this.textfield)
            }
            else {
                let linkElement = document.createElement('a')
                linkElement.setAttribute('href',link)
                linkElement.innerHTML = text

                selectionRange.setStart(this.lastRange.startContainer, this.lastRange.startOffset)
                selectionRange.setEnd(this.lastRange.endContainer, this.lastRange.endOffset)
                selectionRange.deleteContents()
                selectionRange.insertNode(linkElement)
                selectionRange.setEndAfter(linkElement)
                selectionRange.setEndAfter(linkElement)
            }
            selectionRange.collapse()
        }
        this.closePopup()
    }

    getPopupLink () {
        let selection = null
        selection = document.getSelection();
        if ((selection.anchorNode.parentNode.closest('.gnommy-editor-field') || selection.anchorNode.parentNode.classList.contains('gnommy-editor-field')) && selection.anchorNode.parentNode.closest('.gnommy-editor-box') === this.editorbox) {

            if (selection && selection.rangeCount > 0) {
                let selectionRange = selection.getRangeAt(0)

                let text = this.elementToString(selectionRange.cloneContents()),
                    container = selectionRange.commonAncestorContainer,
                    link = ''

                if (container.nodeName == 'A') {
                    selectionRange.selectNode(container)
                    text = container.innerHTML
                    link = container.href
                }

                this.openPopup(this.createLinkPopup(text,link),'link')
                this.lastRange = {'startContainer': selectionRange.startContainer, 'startOffset': selectionRange.startOffset, 'endContainer': selectionRange.endContainer, 'endOffset': selectionRange.endOffset, 'container': container}
            }
        }
    }



    createEditor () {   
        let self = this

        this.editorbox = document.createElement('div')
        this.editorbox.classList.add('gnommy-editor-box')

        this.buttonbox = document.createElement('div')
        this.buttonbox.classList.add('gnommy-editor-buttons')

        this.popuplayer = document.createElement('div')
        this.popuplayer.classList.add('gnommy-editor-popup-layer')
        this.popupwindow = document.createElement('div')
        this.popupwindow.classList.add('gnommy-editor-popup-window')
        //this.popupwindow.append(this.createLinkPopup())
        
        this.popuplayer.append(this.popupwindow)
        this.editorbox.append(this.popuplayer)

        /* buttons */
        this.boldButton = this.createButton()
        this.boldButton.innerHTML = '<b>B</b>'
        this.boldButton.addEventListener('click',function(){
            self.fragmentWrap('b')
        })

        this.italicButton = this.createButton()
        this.italicButton.innerHTML = '<i>I</i>'
        this.italicButton.addEventListener('click',function(){
            self.fragmentWrap('i')
        })
        this.underlineButton = this.createButton()
        this.underlineButton.innerHTML = '<u>U</u>'
        this.underlineButton.addEventListener('click',function(){
            self.fragmentWrap('u')
        })
        this.strikeButton = this.createButton()
        this.strikeButton.innerHTML = '<s>S</s>'
        this.strikeButton.addEventListener('click',function(){
            self.fragmentWrap('s')
        })
        this.colorButton = this.createButton()

        this.ulButton = this.createButton()
        //this.ulButton.innerHTML = 'Test'
        this.ulButton.addEventListener('click',function(){
            self.setList()
        })
        this.ulButton.insertAdjacentHTML('afterbegin',this.buttonPictures.ul)
        this.olButton = this.createButton()
        //this.olButton.innerHTML = 'Test 2'
        this.olButton.addEventListener('click',function(){
            self.setList(true)
        })
        this.olButton.insertAdjacentHTML('afterbegin',this.buttonPictures.ol)

        this.linkButton = this.createButton()
        this.linkButton.addEventListener('click',function(){
            self.getPopupLink()
        })
        this.linkButton.insertAdjacentHTML('afterbegin',this.buttonPictures.link)

        this.unlinkButton = this.createButton()
        this.unlinkButton.addEventListener('click',function(){
            self.unsetLink()
        })
        this.unlinkButton.insertAdjacentHTML('afterbegin',this.buttonPictures.unlink)
        

        this.buttonbox.append(this.boldButton)
        this.buttonbox.append(this.italicButton)
        this.buttonbox.append(this.underlineButton)
        this.buttonbox.append(this.strikeButton)
        this.buttonbox.append(this.ulButton)
        this.buttonbox.append(this.olButton)
        this.buttonbox.append(this.linkButton)
        this.buttonbox.append(this.unlinkButton)
        /* /buttons */

        this.editorfield = document.createElement('div')
        this.editorfield.classList.add('gnommy-editor-field')
        this.editorfield.setAttribute('contenteditable',true)

        this.textfieldbox = document.createElement('div')
        this.textfieldbox.classList.add('gnommy-editor-htmlbox')

        this.footerbox = document.createElement('div')
        this.footerbox.classList.add('gnommy-editor-footer')
        this.footerbox.innerHTML = 'Enter = &lt;br&gt; &nbsp; &nbsp; Ctrl+Enter = &lt;p&gt;'

        this.htmlexpandbutton = document.createElement('div')
        this.htmlexpandbutton.classList.add('gnommy-editor-html-button')
        this.htmlexpandbutton.innerHTML = '&lt;/&gt;';
        this.htmlexpandbutton.setAttribute('title','Show/hide HTML-code')
        this.htmlexpandbutton.addEventListener('click',function(){
            self.textfieldbox.classList.toggle('active')
        })
        this.footerbox.append(this.htmlexpandbutton)

        this.editorbox.append(this.buttonbox)
        this.editorbox.append(this.editorfield)
        this.editorbox.append(this.footerbox)
        this.editorbox.append(this.textfieldbox)

        this.textfield.after(this.editorbox)
        this.textfieldbox.append(this.textfield)

        this.editorfield.addEventListener('keydown',function(e){
            if (e.code == 'Enter' || e.code == 'NumpadEnter') {
                let setParagraph = e.ctrlKey
                if (self.pEnter) {
                    setParagraph = !e.ctrlKey
                }
                self.setBreak(setParagraph)
                e.preventDefault();
            }
        })
        this.editorfield.addEventListener('input',function(){
            self.contentClone(this,self.textfield)
        })
        this.editorfield.addEventListener('DOMNodeInserted',function(){
            self.contentClone(this,self.textfield)
        })
        this.editorfield.addEventListener('DOMNodeRemoved',function(){
            self.contentClone(this,self.textfield)
        })
        this.editorfield.addEventListener('DOMCharacterDataModified',function(){
            self.contentClone(this,self.textfield)
        })
        this.editorfield.addEventListener('DOMAttributeNameChanged',function(){
            self.contentClone(this,self.textfield)
        })
        this.editorfield.addEventListener('DOMAttrModified',function(){
            self.contentClone(this,self.textfield)
        })
        this.editorfield.addEventListener('DOMElementNameChanged',function(){
            self.contentClone(this,self.textfield)
        })
        this.editorfield.addEventListener('DOMSubtreeModified',function(){
            self.contentClone(this,self.textfield)
        })
        this.textfield.addEventListener('input',function(){
            self.contentClone(this,self.editorfield,false)
        })
        self.contentClone(this.textfield,self.editorfield,false)

    }

    openPopup(contentElement,addclass=null) {
        this.popupwindow.append(contentElement)
        this.popuplayer.classList.add('active')
        if (!this.isEmpty(addclass)) {
            this.popupwindow.classList.add(addclass)
        }
    }

    closePopup() {
        this.popuplayer.classList.remove('active')
        this.popupwindow.className = ''
        this.popupwindow.classList.add('gnommy-editor-popup-window')
        this.popupwindow.innerHTML = ''
    }

    setList(number=false,type=null) {
        let selection = document.getSelection()
        let selectionRange = selection.getRangeAt(0)

        if ((selection.anchorNode.parentNode.closest('.gnommy-editor-field') || selection.anchorNode.parentNode.classList.contains('gnommy-editor-field')) && selection.anchorNode.parentNode.closest('.gnommy-editor-box') === this.editorbox) {

            let listNode = selectionRange.commonAncestorContainer,
                    isStart = false,
                    isEnd = false,
                    startLi = this.getParent(selectionRange.startContainer,'LI'),
                    endLi = this.getParent(selectionRange.endContainer,'LI'),
                    fragment

            if (listNode.nodeName == 'OL' || listNode.nodeName == 'UL') {
                
                if (startLi === listNode.firstChild) {
                    isStart = true
                }
                if (endLi === listNode.lastChild) {
                    isEnd = true
                } 
                selectionRange.setStartBefore(startLi)
                selectionRange.setEndAfter(endLi)

                fragment = selectionRange.extractContents()

                if (isStart && !isEnd) {
                    selectionRange.setStartBefore(listNode)
                    selectionRange.collapse(true)
                    selectionRange.insertNode(this.unwrap(fragment.childNodes,'li'))
                    return true
                }
                else if (!isStart && isEnd) {
                    selectionRange.setEndAfter(listNode)
                    selectionRange.collapse()
                    selectionRange.insertNode(this.unwrap(fragment.childNodes,'li'))
                    selectionRange.collapse()
                    return true
                }
                else if (isStart && isEnd) {
                    selectionRange.selectNode(listNode)
                    selectionRange.deleteContents()
                    selectionRange.insertNode(this.unwrap(fragment.childNodes,'li'))
                    selectionRange.collapse()
                    return true
                }
                else { // !isStart && !isEnd
                    let newLi = document.createElement('li'),
                        libr = document.createElement('br')
                    newLi.append(libr)
                    selectionRange.insertNode(newLi)
                    selectionRange.selectNode(libr)
                    selectionRange.deleteContents()
                    fragment = this.unwrap(fragment.childNodes,'li')
                }
            }
            else {
                if (selectionRange.commonAncestorContainer.nodeName == 'LI') {
                    let li = selectionRange.commonAncestorContainer,
                    endLineNode = this.getLineEndNode(selectionRange.endContainer)
                    selectionRange.setEndAfter(endLineNode)
                }
                else {
                    let startLineNode = this.getLineStartNode(selectionRange.startContainer),
                        endLineNode = this.getLineEndNode(selectionRange.endContainer)
                    selectionRange.setStartBefore(startLineNode)
                    selectionRange.setEndAfter(endLineNode)
                }
                fragment = selectionRange.extractContents()
            }
            
            let items = [], i = 0 
            let self = this
            Array.from(fragment.childNodes).forEach(function(node) {
                if (items[i] == undefined) {
                    items[i] = ''
                }
                if (node.nodeName == 'BR') {
                    i++
                }
                else if (node.nodeName == 'P') {
                    i++
                    items[i] = node.innerHTML
                }
                else {
                    if (node.nodeType != 3) {
                        let tmpElement = document.createElement('div')
                        tmpElement.append(node)
                        items[i] += tmpElement.innerHTML
                    }
                    else {
                        items[i] += node.textContent
                    }
                }
            })
            
            let listType = number ? 'ol' : 'ul'
            const list = document.createElement(listType)
            if (items.length > 0) {
                items.forEach(item => {
                    if (item != '') {
                        let element = document.createElement('li')
                        element.insertAdjacentHTML('afterbegin',item)
                        list.append(element)
                    }
                });
            }

            selectionRange.insertNode(list)
            selectionRange.collapse()

        }
    }

    setBreak(setParagraph=false) {
        let selection = document.getSelection(),
            selectionRange = null

        if (selection && selection.rangeCount > 0) {
            selectionRange = selection.getRangeAt(0)
        }

        if (selectionRange) {
            selectionRange.deleteContents()

            let li = this.getParent(selectionRange.commonAncestorContainer,'LI')
            if (!li && selectionRange.commonAncestorContainer.nodeName == 'LI') {
                li = selectionRange.commonAncestorContainer
            }
            
            if (li) {
                selectionRange.setStart(li,0)
                let startFragment = selectionRange.extractContents()
                selectionRange.selectNode(li)
                let endFragment = selectionRange.extractContents()
                const startLi = document.createElement('li')
                startLi.append(startFragment)
                selectionRange.insertNode(startLi)
                selectionRange.setStartAfter(startLi)
                selectionRange.collapse(true)

                if (endFragment.textContent.length > 0) {
                    selectionRange.insertNode(endFragment)
                }
                
                selectionRange.collapse(true)
                return true
            }

            const paragraph = this.getParagraph(selection.anchorNode)

            if (setParagraph) {
                if (paragraph) {
                    selectionRange.setStart(paragraph,0)
                    let startFragment = selectionRange.extractContents()
                    selectionRange.selectNode(paragraph)
                    let endFragment = selectionRange.extractContents()
                    const newParagraph = document.createElement('p')
                    const newBreak = document.createElement('br')
                    newParagraph.append(newBreak)
                    if (startFragment.textContent.length > 0) {
                        const startParagraph = document.createElement('p')
                        startParagraph.append(startFragment)
                        selectionRange.insertNode(startParagraph)
                        selectionRange.setStartAfter(startParagraph)
                        selectionRange.collapse(true)
                    }
                    
                    selectionRange.insertNode(newParagraph)
                    selectionRange.setStartAfter(newParagraph)
                    selectionRange.collapse(true)
                    if (endFragment.textContent.length > 0) {
                        selectionRange.insertNode(endFragment)
                    }
                    
                    selectionRange.setStartAfter(newBreak)
                    selectionRange.collapse(true)
                }
                else {
                    const newParagraph = document.createElement('p')
                    const newBreak = document.createElement('br')
                    newParagraph.append(newBreak)
                    selectionRange.insertNode(newParagraph)
                    selectionRange.setStartAfter(newBreak)
                    selectionRange.collapse(true)
                }
            }
            else {
                const newBreak = document.createElement('br')
                selectionRange.insertNode(newBreak)
                selectionRange.setStartAfter(newBreak)
                selectionRange.collapse(true)
            }
        }
    }

    contentClone(from,to,asText = true) {
        if (typeof from == 'string'){
            from = document.querySelector(from)
        }
        if (typeof to == 'string'){
            to = document.querySelector(to)
        }
        if (from instanceof HTMLElement && to instanceof HTMLElement) {
            let value = from.innerHTML
            if (from.tagName.toLowerCase() === 'input' || from.tagName.toLowerCase() === 'textarea') {
                value = from.value
            }
            if (to.tagName.toLowerCase() === 'input') {
                to.value = value
            }
            else {
                if (asText) {
                    to.innerHTML = value
                }
                else {

                    to.innerHTML = ''
                    to.insertAdjacentHTML('afterbegin', value)
                }
            }
        }
    }

    getParagraph (element) {
        if (element && (element instanceof DocumentFragment || element instanceof HTMLElement || element.nodeType == 3)) {
            if (element.tagName == 'P') {
                return element
            }
            else {
                return this.getParagraph (element.parentElement)
            }
        }
        return false
    }

    getParent (element,nodeName) {
        if (typeof nodeName == 'string' && nodeName.slice(0,1) != '#') {
            nodeName = nodeName.toUpperCase()
        }
        if (this.isEmpty(nodeName)) {
            return false
        }
        if (element && (element instanceof DocumentFragment || element instanceof HTMLElement || element.nodeType == 3)) {
            if (element.tagName == nodeName) {
                return element
            }
            else {
                return this.getParent (element.parentElement,nodeName)
            }
        }
        return false
    }

    getNextSibling(element,nodeName) {
        if (typeof nodeName == 'string' && nodeName.slice(0,1) != '#') {
            nodeName = nodeName.toUpperCase()
        }
        if (this.isEmpty(nodeName)) {
            return false
        }
        if (element && (element instanceof DocumentFragment || element instanceof HTMLElement || element.nodeType == 3)) {
            if (element.nextSibling.nodeName == nodeName || element.nextSibling == this.editorfield) {
                return element
            }
            else {
                return this.getNextSibling (element.nextSibling, nodeName)
            }
        }
        return false
    }

    getPreviousSibling(element,nodeName) {
        if (typeof nodeName == 'string' && nodeName.slice(0,1) != '#') {
            nodeName = nodeName.toUpperCase()
        }
        if (this.isEmpty(nodeName)) {
            return false
        }
        if (element && (element instanceof DocumentFragment || element instanceof HTMLElement || element.nodeType == 3)) {
            if (element.previousSibling.nodeName == nodeName || element.previousSibling == this.editorfield) {
                return element
            }
            else {
                return this.getNextSibling (element.previousSibling, nodeName)
            }
        }
        return false
    }

    getLineStartNode(element) {
        if (element && (element instanceof DocumentFragment || element instanceof HTMLElement || element.nodeType == 3)) {
            if (element.previousSibling === null) {
                if (element.parentNode === this.editorfield || element.parentNode.nodeName == 'LI' || element.parentNode.nodeName == 'UL' || element.parentNode.nodeName == 'OL') {
                    return element
                }
                else if (element.parentNode.nodeName == 'P' || element.parentNode.nodeName == 'DIV') {
                    return element.parentNode
                }
                else {
                    return this.getLineStartNode(element.parentNode)
                }
            }
            else if (element.previousSibling.nodeName == 'DIV' || element.previousSibling.nodeName == 'P' || element.previousSibling.nodeName == 'BR' || element.previousSibling.nodeName == 'LI' || element.previousSibling.nodeName == 'UL' || element.previousSibling.nodeName == 'OL' || element.previousSibling == this.editorfield) {
                return element
            }
            else {
                return this.getLineStartNode (element.previousSibling)
            }
        }
        return false
    }

    getLineEndNode(element) {
        if (element && (element instanceof DocumentFragment || element instanceof HTMLElement || element.nodeType == 3)) {
            if (element.nextSibling === null) {
                if (element.parentNode === this.editorfield || element.parentNode.nodeName == 'LI' || element.parentNode.nodeName == 'UL' || element.parentNode.nodeName == 'OL') {
                    return element
                }
                else if (element.parentNode.nodeName == 'P' || element.parentNode.nodeName == 'DIV') {
                    return element.parentNode
                }
                else {
                    return this.getLineStartNode(element.parentNode)
                }
            }
            else if (element.nextSibling === null || element.nextSibling.nodeName == 'DIV' || element.nextSibling.nodeName == 'P' || element.nextSibling.nodeName == 'BR' || element.nextSibling.nodeName == 'LI' || element.nextSibling.nodeName == 'UL' || element.nextSibling.nodeName == 'OL' || element.nextSibling == this.editorfield) {
                return element
            }
            else {
                return this.getLineEndNode (element.nextSibling)
            }
        }
        return false
    }
    
    isEmpty (value) {
        if (value === null || value === false || value === undefined || value === NaN || value == '' || value === {} || value === [] || value == 'undefined') {
            return true
        }
        return false
    }
    
    objectToSyleStr (obj = {}) {
        let str = ''
        if (!this.isEmpty(obj)) {
            for (var property in obj) {
                str += property + ':' + obj[property] + ';'
            }
        }
        return str
    }

    elementToString (element) {
        let string = '';
        if (element instanceof DocumentFragment || element instanceof HTMLElement) {
            let tmpElement = document.createElement('div')
            tmpElement.append(element)
            string = tmpElement.innerHTML;
        }
        else if (typeof element == 'string') {
            string = element;
        }
        return string
    }
    
    wrap (element, wrapper=null, style='') {
        if (element && (element instanceof DocumentFragment || element instanceof HTMLElement) && !this.isEmpty(wrapper)) {
            wrapper = document.createElement(wrapper);
            if (!this.isEmpty(style)) {
                if (typeof style == 'object') {
                    style = objectToSyleStr(style)
                }
                wrapper.style = style
            }
            wrapper.append(element)
            return wrapper
        }
        return element
    }

    unwrap(nodeList,wrapperName,deep=true) {
        let self = this,
            fragment = new DocumentFragment()
        Array.from(nodeList).forEach(function(node) {
            if (deep && node.childNodes && node.childNodes.length > 0 && (node.childNodes.length > 1 || node.childNodes[0].nodeName != '#text')) {
                fragment.append(self.unwrap(node.childNodes,wrapperName))
            }
            else if (wrapperName.toUpperCase() == node.nodeName) {
                fragment.append(node.textContent)
                if (node.nodeName == 'LI') {
                    fragment.append(document.createElement('br'))
                }
            }
            else {
                fragment.append(node)
            }
        });
        return fragment
    }

    buttonPictures = {
        'ul': `<svg width="18px" height="18px" viewBox="0 0 30 30" version="1.1" id="svg5"><defs id="defs2" /><g id="layer1"><path id="rect1064-5" style="stroke-width:3;stroke-linecap:round" d="m 10,24 h 18 v 2 H 10 Z M 7.9430017,24.991791 A 2.9715009,2.991791 0 0 1 4.9715009,27.983582 2.9715009,2.991791 0 0 1 2,24.991791 2.9715009,2.991791 0 0 1 4.9715009,22 2.9715009,2.991791 0 0 1 7.9430017,24.991791 Z M 10,14 h 18 v 2 H 10 Z M 7.9430013,14.991791 A 2.9715009,2.991791 0 0 1 4.9715004,17.983582 2.9715009,2.991791 0 0 1 1.9999995,14.991791 2.9715009,2.991791 0 0 1 4.9715004,12 2.9715009,2.991791 0 0 1 7.9430013,14.991791 Z M 10,4 H 28 V 6 H 10 Z M 7.9430017,4.9917912 A 2.9715009,2.991791 0 0 1 4.9715009,7.9835823 2.9715009,2.991791 0 0 1 2,4.9917912 2.9715009,2.991791 0 0 1 4.9715009,2.0000002 2.9715009,2.991791 0 0 1 7.9430017,4.9917912 Z" /></g></svg>`,
        'ol': `<svg width="18px" height="18px" viewBox="0 0 30 30" version="1.1" id="svg5"><defs id="defs2" /><g id="layer1"><g aria-label="1" id="text14687" style="font-size:8.50085px;line-height:1.25;font-family:'Barlow ExtraBold';-inkscape-font-specification:'Barlow ExtraBold, ';letter-spacing:0px;word-spacing:0px;stroke-width:0.212522" /><g aria-label="2" id="text14687-3" style="font-size:8.50085px;line-height:1.25;font-family:'Barlow ExtraBold';-inkscape-font-specification:'Barlow ExtraBold, ';letter-spacing:0px;word-spacing:0px;stroke-width:0.212522" /><path id="path22480" d="m 6.6297508,25.08727 q 0.1700169,0.408041 0.1700169,0.875588 0,0.459046 -0.1700169,0.858586 -0.2210221,0.552555 -0.7225723,0.875587 -0.5015501,0.314532 -1.1816181,0.314532 -0.6630663,0 -1.1731172,-0.323033 -0.510051,-0.331533 -0.739574,-0.892589 -0.1360136,-0.340034 -0.1615161,-0.748075 0,-0.10201 0.1020102,-0.10201 h 1.2241223 q 0.1020102,0 0.1105111,0.10201 0.017002,0.212522 0.1020102,0.408041 0.068007,0.170017 0.2040204,0.263526 0.1360136,0.08501 0.3230323,0.08501 0.3570357,0 0.5355535,-0.323032 0.1190119,-0.212522 0.1190119,-0.561056 0,-0.340034 -0.1190119,-0.59506 -0.1785178,-0.314531 -0.5440544,-0.314531 -0.093509,0 -0.2125212,0.06801 -0.1105111,0.05951 -0.2890289,0.187019 -0.042504,0.0255 -0.068007,0.0255 -0.051005,0 -0.076508,-0.051 L 3.4589338,24.390201 q -0.025502,-0.04251 -0.025502,-0.06801 0,-0.051 0.042504,-0.07651 l 1.3091309,-0.994599 q 0.017002,-0.017 0.0085,-0.034 0,-0.017 -0.025502,-0.017 H 2.9063786 q -0.042504,0 -0.076508,-0.0255 -0.025502,-0.034 -0.025502,-0.07651 v -1.0031 q 0,-0.0425 0.025502,-0.06801 0.034003,-0.034 0.076508,-0.034 h 3.7063705 q 0.042504,0 0.068007,0.034 0.034003,0.0255 0.034003,0.06801 v 1.130613 q 0,0.07651 -0.059506,0.127513 l -1.0286028,0.807581 q -0.017002,0.017 -0.017002,0.034 0.0085,0.017 0.034003,0.0255 0.680068,0.178517 0.9860986,0.867086 z M 4.6660545,16.747922 q -0.017002,0.017 -0.0085,0.034 0.0085,0.017 0.034003,0.017 h 2.1677167 q 0.042504,0 0.068007,0.034 0.034003,0.0255 0.034003,0.06801 v 1.0031 q 0,0.0425 -0.034003,0.07651 -0.025503,0.0255 -0.068007,0.0255 h -3.986899 q -0.042504,0 -0.076508,-0.0255 -0.025502,-0.034 -0.025502,-0.07651 v -0.943594 q 0,-0.07651 0.051005,-0.127513 0.510051,-0.476048 1.3516351,-1.368637 l 0.510051,-0.535553 q 0.7735773,-0.79908 0.7735773,-1.164617 0,-0.246524 -0.1870187,-0.408041 -0.1785178,-0.161516 -0.4675467,-0.161516 -0.2890289,0 -0.4675468,0.161516 -0.1785178,0.161517 -0.1785178,0.425043 v 0.20402 q 0,0.04251 -0.034003,0.07651 -0.025503,0.0255 -0.068007,0.0255 H 2.8298709 q -0.042504,0 -0.076508,-0.0255 -0.025503,-0.034 -0.025503,-0.07651 v -0.425042 q 0.034003,-0.476048 0.3145315,-0.833083 0.280528,-0.357036 0.7395739,-0.544055 0.4590459,-0.195519 1.020102,-0.195519 0.6290628,0 1.0966096,0.238023 0.4760476,0.229523 0.7225722,0.629063 0.2550255,0.39954 0.2550255,0.884089 0,0.348534 -0.170017,0.70557 -0.170017,0.357036 -0.510051,0.756576 Q 5.9581828,15.489791 5.6606531,15.78732 5.3631233,16.08485 4.8360707,16.5864 Z M 4.2025246,2.0691242 q 0.068007,-0.025503 0.1275127,-0.025503 h 1.2411241 q 0.042504,0 0.068007,0.034003 0.034003,0.025503 0.034003,0.068007 v 5.7465744 q 0,0.042504 -0.034003,0.076508 -0.025503,0.025502 -0.068007,0.025502 H 4.3640407 q -0.042504,0 -0.076508,-0.025502 -0.025503,-0.034003 -0.025503,-0.076508 V 3.3952567 q 0,-0.017002 -0.017002,-0.034003 -0.017002,-0.017002 -0.034003,-0.0085 l -0.8330832,0.1955195 -0.034003,0.0085 q -0.076508,0 -0.076508,-0.093509 L 3.2504294,2.5706743 q 0,-0.085008 0.076508,-0.1190119 z M 10,24 h 18 v 2 H 10 Z m 0,-10 h 18 v 2 H 10 Z M 10,4 H 28 V 6 H 10 Z" style="font-size:8.50085px;line-height:1.25;font-family:'Barlow ExtraBold';-inkscape-font-specification:'Barlow ExtraBold, ';letter-spacing:0px;word-spacing:0px;stroke-width:0.212522" /></g></svg>`,
        'link': `<svg width="18px" height="18px" viewBox="0 0 30 30" version="1.1" id="svg5"><defs id="defs2" /><g id="layer1"><g aria-label="a" id="text14687" style="font-size:8.50085px;line-height:1.25;font-family:'Barlow ExtraBold';-inkscape-font-specification:'Barlow ExtraBold, ';letter-spacing:0px;word-spacing:0px;stroke-width:0.212522" /><g aria-label="b" id="text14687-3" style="font-size:8.50085px;line-height:1.25;font-family:'Barlow ExtraBold';-inkscape-font-specification:'Barlow ExtraBold, ';letter-spacing:0px;word-spacing:0px;stroke-width:0.212522" /><path id="path30795" style="color:#000000;fill:#000000;stroke-width:0.860644;stroke-linecap:round;-inkscape-stroke:none" d="m 17.52095,15.640807 c 1.300807,-0.567273 2.880881,-0.321499 3.939699,0.737319 l 5.477102,5.477102 c 1.378884,1.378883 1.378884,3.641794 0,5.020676 -1.378882,1.378883 -3.641792,1.378883 -5.020676,0 l -5.477102,-5.477102 c -1.06846,-1.068461 -1.309,-2.667715 -0.721618,-3.975167 l 1.620754,1.66488 c 0.04396,0.340773 0.200673,0.671545 0.47014,0.941012 l 5.477103,5.477101 c 0.64399,0.643991 1.638134,0.643991 2.282124,0 0.64399,-0.643989 0.64399,-1.638134 0,-2.282124 l -5.477102,-5.477102 c -0.285473,-0.285475 -0.639754,-0.4444 -1.001839,-0.476781 z M 11.154289,9.8325194 a 0.89059384,0.89059384 0 0 0 -1.2599225,0 0.89059384,0.89059384 0 0 0 0,1.2599226 l 9.1285015,9.128502 a 0.89059384,0.89059384 0 0 0 1.258733,-0.0011 0.89059384,0.89059384 0 0 0 0.0011,-1.258734 z m 3.157322,2.5989476 C 14.878883,11.130661 14.63311,9.5505883 13.574293,8.4917699 L 8.0971935,3.0146693 c -1.3788833,-1.3788834 -3.6417927,-1.3788834 -5.0206763,0 -1.3788832,1.3788835 -1.3788832,3.6417923 0,5.0206758 l 5.4771015,5.4770999 c 1.0684578,1.068461 2.6677133,1.309 3.9751643,0.721618 L 10.863903,12.61331 C 10.52313,12.56935 10.192359,12.412637 9.9228935,12.14317 L 4.4457925,6.6660699 c -0.6439903,-0.6439904 -0.6439903,-1.6381351 0,-2.2821254 0.6439903,-0.6439904 1.6381347,-0.6439904 2.282125,0 l 5.4771005,5.4771012 c 0.285474,0.2854723 0.444399,0.6397523 0.47678,1.0018363 z" /></g></svg>`,
        'unlink': `<svg width="18px" height="18px" viewBox="0 0 30 30" version="1.1" id="svg5"><defs id="defs2" /><g id="layer1"><g aria-label="a" id="text14687" style="font-size:8.50085px;line-height:1.25;font-family:'Barlow ExtraBold';-inkscape-font-specification:'Barlow ExtraBold, ';letter-spacing:0px;word-spacing:0px;stroke-width:0.212522" /><g aria-label="b" id="text14687-3" style="font-size:8.50085px;line-height:1.25;font-family:'Barlow ExtraBold';-inkscape-font-specification:'Barlow ExtraBold, ';letter-spacing:0px;word-spacing:0px;stroke-width:0.212522" /><path id="path32213" style="fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.135402px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="M 12.529144,15.861136 9.9345687,17.966309 9.344536,16.357302 Z m 0.945985,1.059781 0.09348,3.535012 -1.730809,-0.542465 z m 3.720258,-3.018249 2.594575,-2.105173 0.590033,1.609007 z m -0.912233,-0.917738 -0.09348,-3.535011 1.73081,0.5424641 z m 1.237796,2.655877 c 1.300807,-0.567273 2.880881,-0.321499 3.939699,0.737319 l 5.477102,5.477102 c 1.378884,1.378883 1.378884,3.641794 0,5.020676 -1.378882,1.378883 -3.641792,1.378883 -5.020676,0 l -5.477102,-5.477102 c -1.06846,-1.068461 -1.309,-2.667715 -0.721618,-3.975167 l 1.620754,1.66488 c 0.04396,0.340773 0.200673,0.671545 0.47014,0.941012 l 5.477103,5.477101 c 0.64399,0.643991 1.638134,0.643991 2.282124,0 0.64399,-0.643989 0.64399,-1.638134 0,-2.282124 l -5.477102,-5.477102 c -0.285473,-0.285475 -0.639754,-0.4444 -1.001839,-0.476781 z m -2.640393,0.437826 4.142311,4.142311 c 0.348015,0.346991 0.911325,0.346498 1.258733,-0.0011 0.347599,-0.347408 0.348091,-0.910719 0.0011,-1.258734 l -4.197363,-4.197445 c -1.466896,-0.223377 0.224293,1.626651 -1.204781,1.314968 z m -0.06767,-2.587448 -3.658594,-3.6586656 c -0.347848,-0.348087 -0.912075,-0.348087 -1.2599225,0 -0.3480871,0.3478476 -0.3480871,0.9120746 0,1.2599226 l 3.5937035,3.593704 c 1.652874,0.236978 0.04257,-1.184713 1.324813,-1.194961 z M 14.311611,12.431467 C 14.878883,11.130661 14.63311,9.5505883 13.574293,8.4917699 L 8.0971935,3.0146693 c -1.3788833,-1.3788834 -3.6417927,-1.3788834 -5.0206763,0 -1.3788832,1.3788835 -1.3788832,3.6417923 0,5.0206758 l 5.4771015,5.4770999 c 1.0684578,1.068461 2.6677133,1.309 3.9751643,0.721618 L 10.863903,12.61331 C 10.52313,12.56935 10.192359,12.412637 9.9228935,12.14317 L 4.4457925,6.6660699 c -0.6439903,-0.6439904 -0.6439903,-1.6381351 0,-2.2821254 0.6439903,-0.6439904 1.6381347,-0.6439904 2.282125,0 l 5.4771005,5.4771012 c 0.285474,0.2854723 0.444399,0.6397523 0.47678,1.0018363 z" /></g></svg>`,
        'image': `<svg width="18px" height="18px" viewBox="0 0 30 30" version="1.1" id="svg5"><defs id="defs2" /><g id="layer1"><g aria-label="a" id="text14687" style="font-size:8.50085px;line-height:1.25;font-family:'Barlow ExtraBold';-inkscape-font-specification:'Barlow ExtraBold, ';letter-spacing:0px;word-spacing:0px;stroke-width:0.212522" /><g aria-label="b" id="text14687-3" style="font-size:8.50085px;line-height:1.25;font-family:'Barlow ExtraBold';-inkscape-font-specification:'Barlow ExtraBold, ';letter-spacing:0px;word-spacing:0px;stroke-width:0.212522" /><path id="path32546" style="fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.999999px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" transform="scale(0.26458333)" d="M 49.134766,45.353516 26.457031,75.589844 V 98.267578 H 86.929688 V 64.251953 L 75.589844,52.914062 64.251953,64.251953 Z m 0,4 9.949218,12.4375 c 3.038457,3.79807 -1.59889,2.487883 -4.617187,3.667968 -2.115644,0.827169 -2.323405,4.711514 -3.304688,4.582032 -2.265516,-0.298923 -2.079626,-5.578141 -4.421875,-4.699219 -6.648907,2.494976 -11.979434,9.7537 -9.333984,-0.351563 z m 26.455078,7.560546 5.603515,5.601563 c -1.095031,0.35743 -2.399246,-1.443529 -2.02539,2.507813 -1.637182,-0.189619 -2.869768,-4.213703 -4.97461,0.0625 -0.88004,-0.175182 -1.563768,-0.746943 -1.996093,-1.84375 -0.540405,-1.371013 -3.028216,0.950253 -4.91211,2.070312 l 2.285156,-2.378906 z M 14.992618,7.4335632 V 11.338583 109.73179 H 98.393209 V 7.4335632 Z m 7.81004,7.8100388 H 90.583171 V 101.92175 H 22.802658 Z" /></g></svg>`

    }
}
var app = app || {}; //If variable app already exist, then load it. If id doesn't, then create a new object


//wrapping function in parenthesis runs it immediately. 
//It's the same as applying the function right after the function has been read
app.main = (function(){
	var elements = {
		noteField : document.querySelector('.write-note'),
		noteSubmit : document.querySelector('.submit-note'),
		noteList : document.querySelector('.notes'),
		noNotesFound : document.querySelector('.no-notes-found')
	};

	var notes = [];

	var attachEvents = function(){
		elements.noteSubmit.addEventListener('click', function(event) {
			event.preventDefault();
			var fieldNote = elements.noteField.value;
			var newNote = new Model({ noteBodyText : fieldNote, like : false }, notes).save();
			new View(newNote, elements.noteList).init();
			elements.noteField.value = '';
		});
	};

	//Puts the lates note to the top of the list
	var addAsFirstChild = function(parent, child){
		var parentNode = parent,
		childNode = child;
		if(parentNode.firsChild){
			parentNode.insertBefore(child,parent.firsChild);
		}else{
			parentNode.appendChild(child);
		}
	};

	var View = function (note, containerEl) {
		var index = notes.indexOf(note),
			that = this;

		this.render = function (argument) {
			this.listItem = document.createElement('li');
			this.paragraph = document.createElement('p');
			this.actions = document.createElement('div');
			this.removeButton = document.createElement('button');
			this.likeButton = document.createElement('button');

			this.listItem.classList.add('note');
			this.actions.classList.add('actions');
			this.removeButton.classList.add('remove', 'icon-cancel');
			this.likeButton.classList.add('like', 'icon-heart');

			this.paragraph.innerHTML = note.data.noteBodyText;
			this.actions.appendChild(this.removeButton);
			this.actions.appendChild(this.likeButton);
			this.listItem.appendChild(this.paragraph);
			this.listItem.appendChild(this.actions);

			if(note.data.liked){
				this.likeButton.classList.add('liked');
			}

			addAsFirstChild(elements.noteList, this.listItem);
			elements.noNotesFound.classList.add('hidden');
			return this;

		};
		this.like = function(){
			note.like();
			that.likeButton.classList.toggle('liked');
		};
		this.remove = function(){
			elements.noteList.removeChild(that.listItem);
			note.remove();
			if(elements.noteList.childElementCount === 0){
				elements.noNotesFound.classList.remove('hidden');
			}
		};
		this.attachEvents = function(){
			this.likeButton.addEventListener('click', this.like);
			this.removeButton.addEventListener('click', this.remove);
		};
		this.init = function(){
			this.render();
			this.attachEvents();
			return this;
		};
	};


	//Models are the objects that hold the data for us
	//They also hold some extra methods that allow us to work with the data
	var Model = function (noteData, collection) {

		/*
			noteDate = {
				noteBodyText : 'blah blah',
				liked : false	
			}

		*/

		this.data = noteData;

		this.save = function(){
			collection.push(this.data);
			localStorage.setItem('notes', JSON.stringify(collection)); //local storage stores json, so we need to stringify it 
			return this;
		};

		this.like = function(){
			this.data = !this.data.liked;
			var indexToUpdate = collection.indexOf(this.data);
			collection.splice(indexToUpdate,1,this.data);
			localStorage.setItem('notes', JSON.stringify(collection));
			return this;
		};

		this.remove = function(){
			var indexToRemove = collection.indexOf(this.data);
			collection.splice(indexToRemove, 1); //remove one item from the array and replace it with nothing
			localStorage.setItem('notes', JSON.stringify(collection));
		};
	};

	var initialRender = function(){
		if(('notes' in localStorage && JSON.parse(localStorage.getItem('notes')).length > 0)){
			notes = JSON.parse(localStorage.getItem('notes')).slice(); //populate notes with what's inside localstorage
			
			var i = 0,
				len = notes.length,
				loadedNote;

			for(i; i < len; i += 1){
				loadedNote = new Model(notes[i], notes);
				new View(loadedNote, elements.noteList).init();
			}

		} else{
			elements.noNotesFound.classList.remove('hidden');
		}
	};

	var init = function(){
		console.log('App initialised');
		attachEvents();
		initialRender();
		console.log('Local storage: ',localStorage);
	};

	return {
		init : init,
		notes : notes
	};

})();

window.addEventListener('DOMContentLoaded', app.main.init);
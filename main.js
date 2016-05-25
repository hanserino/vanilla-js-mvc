var app = app || {}; //Load if variable app already exist. If not - create a new object


//wrapping function in parenthesis runs it immediately. 
//It's the same as applying the function right after the function has been read
app.main = (function () {
    var elements = {
        todoInput: document.querySelector('.todo-form__input'),
        todoSubmit: document.querySelector('.todo-form__submit-button'),
        todoList: document.querySelector('.todo-list'),
        noTodosFound: document.querySelector('.no-todos-found'),
        clearTodoListButton: document.querySelector('.clear-todo-list-button')
    };

    var terms = {
        removeItem: "Remove",
        done: "Done",
        emptyInput: "You need some content in that input, son"
    };

    var todos = [];

    var attachEvents = function () {
        elements.todoSubmit.addEventListener('click', function (event) {
            event.preventDefault();

            if (elements.todoInput.value != '') {
                event.preventDefault();
                var fieldNote = elements.todoInput.value;
                var newNote = new Model({noteBodyText: fieldNote, done: false}, todos).save();
                new View(newNote, elements.todoList).init();
                elements.todoInput.value = '';

            } else {
                alert(terms.emptyInput);
            }
        });

        elements.clearTodoListButton.addEventListener('click', function(){
            localStorage.clear();
        });

    };

    //Puts the latest item to the top of the list
    var addAsFirstChild = function (parent, child) {
        var parentNode = parent;

        if (parentNode.firstChild) {
            parentNode.insertBefore(child, parent.firstChild);
        } else {
            parentNode.appendChild(child);
        }
    };

    var View = function (todo, containerEl) {
        var index = todos.indexOf(todo),
            that = this;

        this.render = function (argument) {
            this.listItem = document.createElement('li');
            this.paragraph = document.createElement('p');
            this.actions = document.createElement('div');
            this.removeButton = document.createElement('button');
            this.doneButton = document.createElement('button');

            this.listItem.classList.add('todo-item');
            this.paragraph.classList.add('todo-item__text');
            this.actions.classList.add('todo-item__actions');
            this.removeButton.classList.add('remove');
            this.doneButton.classList.add('done');

            this.doneButton.innerHTML = terms.done;
            this.removeButton.innerHTML = terms.removeItem;

            this.paragraph.innerHTML = todo.data.noteBodyText;
            this.actions.appendChild(this.removeButton);
            this.actions.appendChild(this.doneButton);
            this.listItem.appendChild(this.actions);
            this.listItem.appendChild(this.paragraph);

            if (todo.data.done) {
                this.doneButton.classList.add('done');
            }

            addAsFirstChild(elements.todoList, this.listItem);
            elements.noTodosFound.classList.add('hidden');
            return this;

        };
        this.done = function () {
            todo.done();
            that.listItem.classList.toggle('todo-item--done');
        };
        this.remove = function () {
            elements.todoList.removeChild(that.listItem);
            todo.remove();
            if (elements.todoList.childElementCount === 0) {
                elements.noTodosFound.classList.remove('hidden');
            }
        };
        this.attachEvents = function () {
            this.doneButton.addEventListener('click', this.done);
            this.removeButton.addEventListener('click', this.remove);
        };

        this.init = function () {
            this.render();
            this.attachEvents();
            return this;
        };
    };


    var Model = function (todoData, collection) {

        /*
         todoData = {
             noteBodyText : 'blah blah',
             done : false
         }

         */

        this.data = todoData;

        this.save = function () {
            collection.push(this.data);
            localStorage.setItem('todos', JSON.stringify(collection));
            return this;
        };

        this.done = function () {
            this.data = !this.data.done;
            var indexToUpdate = collection.indexOf(this.data);
            collection.splice(indexToUpdate, 1, this.data);
            localStorage.setItem('todos', JSON.stringify(collection));
            console.log(todos);
            return this;
        };

        this.remove = function () {
            var indexToRemove = collection.indexOf(this.data);
            collection.splice(indexToRemove, 1);
            localStorage.setItem('todos', JSON.stringify(collection));
        };
    };

    var initialRender = function () {
        if (('todos' in localStorage && JSON.parse(localStorage.getItem('todos')).length > 0)) {
            todos = JSON.parse(localStorage.getItem('todos')).slice();

            var i = 0,
                len = todos.length,
                loadedNote;

            for (i; i < len; i += 1) {
                loadedNote = new Model(todos[i], todos);
                new View(loadedNote, elements.todoList).init();
            }

        } else {
            elements.noTodosFound.classList.remove('hidden');
        }
    };

    var init = function () {
        console.log('App initialised');
        attachEvents();
        initialRender();
    };

    return {
        init: init,
        todos: todos
    };

})();

window.addEventListener('DOMContentLoaded', app.main.init);
App = Ember.Application.create({
    ready: function(){
        console.log('App created and ready...');
    }
});

/*
  Model
*/

var names = ["Adam", "Bert", "Charlie", "Dave", "Ernie", "Frances",
  "Gary", "Isabelle", "John", "Kyle", "Lyla", "Matt", "Nancy", "Ophelia",
  "Peter", "Quentin", "Rachel", "Stan", "Tom", "Uma", "Veronica", "Wilson",
  "Xander", "Yehuda", "Zora"];

App.Contact = Ember.Object.extend({
  firstName: '',
  lastName: '',

  hasName: function() {
    var firstName = this.get('firstName'),
        lastName = this.get('lastName');

    return firstName !== '' || lastName !== '';
  }.property('firstName', 'lastName'),

  // This value is used to determine how the contact
  // should be sorted in the contacts list. By default
  // we sort by last name, but we use the first name if
  // no last name is provided.
  sortValue: function() {
    return this.get('lastName') || this.get('firstName');
  }.property('firstName', 'lastName')
});

// model, single row item object.
App.Tweet = Ember.Object.extend({
    avatar: '',
    screen_name: '',
    text: '',
    date: ''
});

/*
  Controllers == Array
*/
App.contactsController = Ember.ArrayController.create({
  // The array of Contact objects that backs the array controller.
  content: [],   // content stores data set

  // Adds a new contact to the list and ensures it is
  // sorted correctly.
  add: function(contact) {
    var length = this.get('length'), idx;

    idx = this.binarySearch(contact.get('sortValue'), 0, length);

    this.insertAt(idx, contact);

    // If the value by which we've sorted the contact
    // changes, we need to re-insert it at the correct
    // location in the list.
    contact.addObserver('sortValue', this, 'contactSortValueDidChange');
  },

  // Binary search implementation that finds the index
  // where a contact should be inserted.
  binarySearch: function(value, low, high) {
    var mid, midValue;

    if (low === high) {
      return low;
    }

    mid = low + Math.floor((high - low) / 2);
    midValue = this.objectAt(mid).get('sortValue');

    if (value > midValue) {
      return this.binarySearch(value, mid+1, high);
    } else if (value < midValue) {
      return this.binarySearch(value, low, mid);
    }

    return mid;
  },

  remove: function(contact) {
    this.removeObject(contact);
    contact.removeObserver('sortValue', this, 'contactSortValueDidChange');
  },

  contactSortValueDidChange: function(contact) {
    this.remove(contact);
    this.add(contact);
  },

  // Creates a new, empty Contact object and adds it to the
  // array controller.
  newContact: function() {
    var firstName = Math.floor(Math.random()*names.length),
        lastName = Math.floor(Math.random()*names.length),
        hasLastName = Math.random();

    this.add(App.Contact.create({  // App.Model-Obj.create({})
      firstName: names[firstName],
      lastName: hasLastName < 0.9 ? names[lastName] : null,
      phoneNumbers: []
    }));
  },

  loadContacts: function() {
    console.log('controller loadContacts : ajax http request /contacts.json, should use websocket ss.rpc ');
    var self = this;
    $.ajax({
      url: '/contacts.json',
      dataType: 'json',
      success: function(data) {
        var contacts = data.contacts;

        // Turn JSON objects into bindable Ember
        // objects. List comprehension, iter each item and apply mapred func.
        contacts = contacts.map(function(item) {
          return self.createContactFromJSON(item);
        });

        self.set('content', contacts);
      },

      error: function() {
        self.pushObject(self.createContactFromJSON({
          firstName: 'Peter',
          lastName: 'Wagenet',
          phoneNumbers: ['(415) 555-2381']
        }));

        self.set('isFromFixtures', true);
      }
    });
  },

  loadTweet: function() {
    var self = this;
    $.getJSON(url,function(data){
      self.set('content', []);
      $(data).each(function(index,value){
        var t = App.Tweet.create({
            avatar: value.user.profile_image_url,
            screen_name: value.user.screen_name,
            text: value.text,
            date: value.created_at
        });
        self.pushObject(t);
      })
    });
  },

  // load contacts using ws request ss.rpc
  wsLoadContacts: function() {
    console.log('ss.rpc load contacts...');
  },

  createContactFromJSON: function(json) {
    json.phoneNumbers = json.phoneNumbers.map(function(number) {
      return { number: number };
    });

    return App.Contact.create(json);
  }
});

//App.contactsController.loadContacts();

// controller == array, store data in default content
App.selectedContactController = Ember.Object.create({
  content: null
});

// clickable view, defined by css class .delete-number-view: bkg-image: url(delete.png)
App.DeleteNumberView = Ember.View.extend({
  classNames: ['delete-number-view'],
  click: function() {
    var phoneNumber = this.get('content');
    var contact = this.getPath('contentView.content');

    contact.get('phoneNumbers').removeObject(phoneNumber);
  },

  touchEnd: function() {
    this.click();
  }
});

// EditField is a view with templateName can handle doubleclick and keyup events.
App.EditField = Ember.View.extend({
  tagName: 'span',
  templateName: 'edit-field',

  doubleClick: function() {  // same name event handle
    this.set('isEditing', true);
    return false;
  },

  touchEnd: function() {
    // Rudimentary double tap support, could be improved
    var touchTime = new Date();
    if (this._lastTouchTime && touchTime - this._lastTouchTime < 250) {
      this.doubleClick();
      this._lastTouchTime = null;
    } else {
      this._lastTouchTime = touchTime;
    }

    // Prevent zooming
    return false;
  },

  focusOut: function() {
    this.set('isEditing', false);
  },

  keyUp: function(evt) {
    if (evt.keyCode === 13) {
      this.set('isEditing', false);
    }
  }
});

App.TextField = Ember.TextField.extend({
  didInsertElement: function() {
    this.$().focus();
  }
});

// editable helper, {{editable}}, is a EditField view
Ember.Handlebars.registerHelper('editable', function(path, options) {
  options.hash.valueBinding = path;
  return Ember.Handlebars.helpers.view.call(this, App.EditField, options);
});

// button helper, {{#button}} just a Em.Button with target set
Ember.Handlebars.registerHelper('button', function(options) {
  var hash = options.hash;

  if (!hash.target) {
    hash.target = "App.contactsController";
  }
  return Ember.Handlebars.helpers.view.call(this, Ember.Button, options);
});

// ListView should be Row View. Each in Controller has a view, with click/touchEnd event handler. 
App.ContactListView = Ember.View.extend({
  classNameBindings: ['isSelected'],

  click: function() {
    var content = this.get('content');
    console.log('listview clicked : content :', content);

    App.selectedContactController.set('content', content);
  },

  touchEnd: function() {
    this.click();
  },

  isSelected: function() {
    var selectedItem = App.selectedContactController.get('content'),
        content = this.get('content');

    if (content === selectedItem) { return true; }
  }.property('App.selectedContactController.content')
});

// CardView is detail fragment whose content binding to selectedController content
// contains functions to handle add phone button. 
App.CardView = Ember.View.extend({
  contentBinding: 'App.selectedContactController.content',
  classNames: ['card'],

  addPhoneNumber: function() {
    var phoneNumbers = this.getPath('content.phoneNumbers');
    phoneNumbers.pushObject({ number: '' });
  }
});


// handle ss.event where async data can come in
ss.event.on('locpoint', function(data){
    var loc = JSON.parse(data);
    console.log('event : locpoint :', lco);
});


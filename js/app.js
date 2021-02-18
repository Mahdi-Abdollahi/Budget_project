
// BUDEGET CONTROLLER
var budgetController = (function(){
  
  let Expense = function(id , description , value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = 1;
  };
  
  Expense.prototype.calcPercentage = function(totalIncom) {
    if(totalIncom > 0){
      this.percentage = Math.round((this.value / totalIncom) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  let Income = function(id , description , value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function (cur, i) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  let data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    percentage: 0
  };


  return {

    addItem: function(type, des, val) {
      let newItem, ID;
      //create ID
      if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      else {
        ID = 0;
      }
      //Create new item
      if(type === 'exp') {
        newItem = new Expense(ID, des, val);
      }
      else if(type === 'inc'){
        newItem = new Income(ID, des, val);
      }
      // push new item to the structure
      data.allItems[type].push(newItem);

      // Return the new Item
      return newItem;
    },
    
    calculateBudget: function() {
      // calculate to total incom or expres
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate the Budget
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of experes
      if(data.totals.inc > 0){
        data.percentage = Math.floor(data.totals.exp / data.totals.inc * 100);
      } else data.percentage = -1;
    },

    getBudget: function() {
      return{
        budget: data.budget,
        percentage: data.percentage,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp
      }
    },

    deleteItem: function(type, id) {
      let index;
      var ids;
      ids = data.allItems[type].map(function(cur) {
        return cur.id;
      });
      index = ids.indexOf(id);
      data.allItems[type].splice(index, 1);
    },


    calPercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
      let percentagesArr = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return percentagesArr;
    },

    
    // getPercentagesArr: function() {
    // },


    test: function() {
      console.log(data);
    }
    

  };
  
})();


//UI CONTROLLER
let UIController = (function(){
  let DOMStrings = {
    inputType: '.add__type',
    inputValue: '.add__value',
    inputDescription: '.add__description',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    totalIncLabel: '.budget__income--value',
    totalExpLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    percentageItemLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  let NodeListForEach = function(list , callback) {
    for(i = 0; i < list.length; i++) {
      callback(list[i] , i);
    }
  };

  let numberDisplay = function(num, type) {
    let dec, int, numsplit;

    num = Math.abs(num);
    num = num.toFixed(2);

    numsplit = num.split('.');
    int = numsplit[0];
    dec = numsplit[1];

    if(int.length > 3 && int.length < 7) {
      int = int.substr(0 , int.length - 3) + ',' + int.substr(int.length - 3, 3);
    } else if(int.length > 6) {
      int = int.substr(0 , int.length - 6) + ',' + int.substr(int.length - 6, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    return (type === 'exp' ? '- ' : '+ ') + int + '.' + dec;
    
  };

  return {
    getInput: function() {
      return{
        type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    getDOMstrings: function() {
      return DOMStrings;
    },

    addListItem: function(obj, type) {
      let html, newHtml, element;
      // Create Html string with placeholder text
      if(type === 'exp') {
        element = DOMStrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div> </div>';

      } else if(type === 'inc') {
        element = DOMStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';

      }
      // replace the placeholder text with some actual data
      newHtml = html.replace('%id%' , obj.id);
      newHtml = newHtml.replace('%description%' , obj.description);
      newHtml = newHtml.replace('%value%' , numberDisplay(obj.value, type));

      // Insert the html into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorId) {
      let el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      let fields, fieldsArr;

      fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(corrent , index , array) {
        corrent.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      if(obj.budget >= 0){
        document.querySelector(DOMStrings.budgetLabel).textContent = numberDisplay(obj.budget, 'inc');
      } else if(obj.object < 0) {
        document.querySelector(DOMStrings.budgetLabel).textContent = numberDisplay(obj.budget, 'exp');
      }
      document.querySelector(DOMStrings.totalIncLabel).textContent = numberDisplay(obj.totalInc, 'inc');
      document.querySelector(DOMStrings.totalExpLabel).textContent = numberDisplay(obj.totalInc, 'exp');
      if(obj.percentage >= 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else document.querySelector(DOMStrings.percentageLabel).textContent = '---';
    },

    displayPercentages: function(percentageArr) {
      let fields = document.querySelectorAll(DOMStrings.percentageItemLabel);

      NodeListForEach(fields, function(cur ,index) {
        if(percentageArr[i] > 0) {
          cur.textContent = percentageArr[i] + '%';
        } else {
          cur.textContent = '---';
        }
      });
    },

    displayMonth: function() {
      let now, month, year, months;
      now = new Date();
      months = ['January', 'February', 'march', 'April', 'May', 'June', 'july', 'August',
      'September', 'October', 'November', 'December']
      month = months[now.getMonth()];
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent = month + ' ' + year;
    },

    changeType: function() {
      let fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputDescription + ',' +
        DOMStrings.inputValue);

        NodeListForEach(fields, function(cur) {
          cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    }

    
  };
})();


//GROBAL APP CONTROLLER
let controller = (function(budgetCtrl, UIctrl) {

  let setupEventListeners = function() {
    let DOM = UIctrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click' , ctrlAddItem);

    document.addEventListener('keypress', function(e) {
      if(e.keyCode === 13 || e.which === 13){
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changeType);
  };

  let updateBudget = function() {
    // Update budget
    budgetCtrl.calculateBudget()
    // Return the budget
    let budget = budgetCtrl.getBudget();
    // Display the budget on the UI
    UIctrl.displayBudget(budget);
  };

  let updatePercentage = function() {
  // 1. calculate the percentage
  let percentages = budgetCtrl.calPercentages();
    // 2. get the budget 
    // let percentages = budgetCtrl.getPercentagesArr();
  // 3. update in UI
    UIctrl.displayPercentages(percentages);
  };

  let ctrlAddItem = function() {
    let input, newItem;
    // 1. Get the filed input data
    input = UIctrl.getInput();
    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type , input.description , input.value);

      // 3. Add the item to the UI
      UIctrl.addListItem(newItem, input.type);
      UIctrl.clearFields();
      // 4. Calculate the budget
      updateBudget();
      // 5. Display the budget on the UI
      updatePercentage();
    }
  };

  let ctrlDeleteItem = function(event) {
    let split, type, id, eventId;
    eventId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(eventId) {
      splitId = eventId.split('-');
    }
    type = splitId[0];
    id = Number(splitId[1]);
    budgetCtrl.deleteItem(type , id);
    UIctrl.deleteListItem(eventId);
    updateBudget();
    updatePercentage();
  };

  return {
    init: function() {
      console.log('app started');
      UIctrl.displayMonth();
      setupEventListeners();
      UIctrl.displayBudget({
        budget: 0,
        percentage: 0,
        totalInc: 0,
        totalExp: 0
      });
    },
  };

})(budgetController, UIController);

controller.init();









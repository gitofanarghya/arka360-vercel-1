<template>
    <div class="overflowMD">
      <table :id="id">
        <tr>
          <th v-for="(time, index) in timeColumn" :key="index" class="verticalTextTime">{{time}}</th>     
        </tr>
        <tr  :class="[id=='value1' ? 'tableTr1' : 'tableTr2']" v-for="(row, index) in actualData" :key="index">
          <th class="monthText">{{monthColumn[index]}}</th>
          <td :class="[id=='value1' ? 'tableTd1' : 'tableTd2']" v-for="(value, colIndex) in row" :key="colIndex" @blur="updateValue(index, colIndex, $event.target.innerText)">{{ value }}</td>
        </tr>
      </table>
    </div>
</template>

<script>
export default {
  data() {
    return {
      tableData1: null,
      tableData2: null,
      defaultData: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      actualData: null,
      monthColumn: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      timeColumn: ['', '12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm']
    };
  },

  emits: ['forTableOne', 'forTableTwo'],

  props: {
    id: {
      type: String,
      required: true
    },
    weekdaySchedule:{
      default: null
    },
    weekendSchedule:{
      default: null
    },
    periodsAvailable:{
      default: 1
    }
  },


  mounted() {
    let count = 1;
    var self = this;
    self.actualData = self.id=='value1' ? self.weekdaySchedule : self.weekendSchedule;
    self.actualData = self.actualData ? self.actualData : self.defaultData;
    setTimeout(function () {
      var table = document.getElementById(self.id);
      var isMouseDown = false;
      var startRowIndex = null;
      var startCellIndex = null;

      var handleKeyPress = function(event) {
    count++;
    if(event.key!=0 && !isNaN(event.key) && event.key <= self.periodsAvailable){
      var selectedCells = document.getElementsByClassName("selectedCell");       
      for (var i = 0; i < selectedCells.length; i++) {
        selectedCells[i].innerText = event.key;
        switch(event.key) {
          case '1':
            selectedCells[i].style.backgroundColor = '#8ee2ab';
            break;
          case '2':
            selectedCells[i].style.backgroundColor = '#80b3b3';
            break;
          case '3':
            selectedCells[i].style.backgroundColor = '#c59430';
            break;
          case '4':
            selectedCells[i].style.backgroundColor = '#2dae85';
            break;
          case '5':
            selectedCells[i].style.backgroundColor = '#dbdb70';
            break;
          case '6':
            selectedCells[i].style.backgroundColor = '#ce3939';  
            break;
          case '7':
            selectedCells[i].style.backgroundColor = '#b2b8bd';  
            break;
          case '8':
            selectedCells[i].style.backgroundColor = '#43c1e1';  
            break;
          case '9':
            selectedCells[i].style.backgroundColor = '#e2c453';  
            break;    
          default:
            break;
        }
      }
    }
    else{
      self.$message({
          showClose: true,
          message: "You haven't defined the period in the table. Please mark the defined periods only.",
          type: 'warning'
        });
    }
  };

      table.addEventListener("mousedown", function () {
        // Remove focus from all input tags
        var inputs = document.querySelectorAll("input, select");
        for (var i = 0; i < inputs.length; i++) {
          inputs[i].blur();
        }
      });

      function selectTo(cell) {
          var row = cell.parentNode;
          var cellIndex = Array.prototype.indexOf.call(row.children, cell);
          var rowIndex = Array.prototype.indexOf.call(table.rows, row);

          var rowStart, rowEnd, cellStart, cellEnd;

          if (rowIndex < startRowIndex) {
              rowStart = rowIndex;
              rowEnd = startRowIndex;
          } else {
              rowStart = startRowIndex;
              rowEnd = rowIndex;
          }

          if (cellIndex < startCellIndex) {
              cellStart = cellIndex;
              cellEnd = startCellIndex;
          } else {
              cellStart = startCellIndex;
              cellEnd = cellIndex;
          }        

          for (var i = rowStart; i <= rowEnd; i++) {
              var rowCells = table.rows[i].cells;
              for (var j = cellStart; j <= cellEnd; j++) {
                  rowCells[j].classList.add("selectedCell");
              }        
          }
      }

      var cells = self.id == 'value1' ? table.getElementsByClassName("tableTd1") : table.getElementsByClassName("tableTd2");
      for (var i = 0; i < cells.length; i++) {
          cells[i].addEventListener("mousedown", function (e) {
              isMouseDown = true;
              var cell = e.currentTarget;
              var selectedCell = table.getElementsByClassName("selectedCell");
              while (selectedCell.length > 0) {
                  selectedCell[0].classList.remove("selectedCell");
              }

              if (e.shiftKey) {
                  selectTo(cell);                
              } else {
                  cell.classList.add("selectedCell");
                  startCellIndex = Array.prototype.indexOf.call(cell.parentNode.children, cell);
                  startRowIndex = Array.prototype.indexOf.call(table.rows, cell.parentNode);
              }

              e.preventDefault();
          });
          cells[i].addEventListener("mouseover", function (e) {
              if (!isMouseDown) return;
              var selectedCell = table.getElementsByClassName("selectedCell");
              while (selectedCell.length > 0) {
                  selectedCell[0].classList.remove("selectedCell");
              }
              selectTo(e.currentTarget);
          });
          cells[i].addEventListener("selectstart", function (e) {
              e.preventDefault();
          });
          switch(cells[i].innerText) {
            case '1':
              cells[i].style.backgroundColor = '#8ee2ab';
              break;
            case '2':
              cells[i].style.backgroundColor = '#80b3b3';
              break;
            case '3':
              cells[i].style.backgroundColor = '#c59430';
              break;
            case '4':
              cells[i].style.backgroundColor = '#2dae85';
              break;
            case '5':
              cells[i].style.backgroundColor = '#dbdb70';
              break;
            case '6':
              cells[i].style.backgroundColor = '#ce3939';  
              break;
            case '7':
              cells[i].style.backgroundColor = '#b2b8bd';  
              break;
            case '8':
              cells[i].style.backgroundColor = '#43c1e1';  
              break;
            case '9':
              cells[i].style.backgroundColor = '#e2c453';  
              break;    
            default:
              break;
          }
      }

      // Add event listener to all input fields to deselect selected cells
      var inputs = table.querySelectorAll("input, select");
      for (var i = 0; i < inputs.length; i++) {
          inputs[i].addEventListener("click", function() {
              console.log("Claedd");
              var selectedCells = table.getElementsByClassName("selectedCell");
              while (selectedCells.length > 0) {
                  selectedCells[0].classList.remove("selectedCell");
              }
          });
      }


      var observer = new MutationObserver(function(mutations) {
    // Create a 2D array to store all cell values
      var selectedCells = document.getElementsByClassName("selectedCell");
      var cellValues = [];
      var rows = table.rows;
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowValues = [];
        for (var j = 1; j < row.cells.length; j++) {
          rowValues.push(row.cells[j].innerText);
        }
        cellValues.push(rowValues);
      }
      // Log the 2D array
      if(selectedCells[0].classList.contains("tableTd1")){
        self.$emit('forTableOne', cellValues);
      } else {
        self.$emit('forTableTwo', cellValues);
      }
    });
    observer.observe(table, { childList: true, subtree: true, characterData: true });
      
    table.addEventListener("mouseup", function () {
      isMouseDown = false;
        document.addEventListener("keypress", handleKeyPress); 
    });

    document.addEventListener("click", function(event) {
      if (!table.contains(event.target)) {
        document.removeEventListener("keypress", handleKeyPress);
        var selectedCell = document.querySelector(".selectedCell");
        if (selectedCell !== null) {
            var cells = table.querySelectorAll(".selectedCell");
            for (var i = 0; i < cells.length; i++) {
                cells[i].classList.remove("selectedCell");
            }
        }
      }
    });
    },0); 
  },

  methods: {
    updateSelectedCell() {
      for(let row = 0; row < this.defaultData.length; row++){
        for(let column = 0; this.defaultData[row].length-1; column++) {
          this.actualData[row][column] = this.actualData[row][column] <= this.periodsAvailable ? this.actualData[row][column] : 1;
        }
      }
      if (this.id == 'value1') {
        this.$emit('forTableOne', this.actualData);
      } else {
        this.$emit('forTableTwo', this.actualData);
      }
    }
  },

  watch: {
    periodsAvailable: {
      handler(val){
        if (val > 0) {
          let table = document.getElementById(this.id);
          let cells = table.getElementsByTagName('td');

          for (let i = 0; i < cells.length; i++) {
            if (parseInt(cells[i].innerHTML) > this.periodsAvailable) {
              cells[i].innerHTML = '1';
              cells[i].style.backgroundColor = '#8ee2ab';
            }
          }
        }
      }
    }
  }
};
</script>

<style lang="css" scoped>
table{
  color: black;
  font-weight: 600;
}


.verticalTextTime{
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  padding-top: 2mm;
  text-align: left;
  font-size: 14px;
  font-weight: normal;
}

.monthText{
  padding-right: 2mm;
  font-size: 14px;
  font-weight: normal;
  white-space: nowrap;
}

table td {
    border: 1px solid #999;
    width: 20.7px;
    /* padding: 26px; */
    height: 16px;
    margin: 10px;
    text-align: center;
    font-size: 14px;
    background-color: #8ee2ab;
    font-weight: normal;
}

/* tr:before {
    content: "Jan";
    float: right;
} */

td.selectedCell {
    background-color: green !important;
}

table td {
   user-select: none;
}

@media (max-width: 1240px) {
  table td {
    width: 30px;
    height: 25px;
}

@media (max-width: 583px) {
  .overflowMD {
    overflow: hidden;
    overflow-x: scroll;
    padding-bottom: 4px;
  }

  .overflowMD::-webkit-scrollbar {
    height: 4px;
  }
}
}


</style>
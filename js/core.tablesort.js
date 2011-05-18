TableSort = new Class({
	options		: {
		theadIndex	: 0,
		tbodyIndex	: 0,
		useCache	: true,
		cellRules	: {}
	},
	
	initialize : function(element, options){
		this.setOptions(options);		
		this.table 			= $(element);
		this.thead 			= $($T('thead', this.table)[this.options.theadIndex]);
		this.tbody 			= $($T('tbody', this.table)[this.options.tbodyIndex]);
		this.cells			= {};
		
		this.attach();
		return this;
	},
		
	attach : function(){
		var self = this;
		this.theadCells  = this.thead.getElements('th, td');
		
		this.thead.addEvent('click', function(event){	
			var cell = event.target;
			if(!['TH','TD'].contains(cell.nodeName) || cell.nodeType !== 1) {
				cell = cell.traverse('parentNode', null, null, function(el) { return ['TH','TD'].contains(el.nodeName);}).getLast();
			}
			cell.mode = cell.mode === 'asc' ? 'desc' : 'asc';
			this.sort(cell);											
		}.bind(this));
		
		// Find the prevCell
		
		this.theadCells.each(function(cell, index) {
			if(cell.className.indexOf('sort-') != -1) {
				self.cell = cell;
			}
		});
		
		return this;		
	},
	
	detach : function() {
		this.thead.removeEvents('click');
		return this;
	},
	
	compare : function(input) {
		var rule	= this.options.cellRules[this.sortIndex];
		var type	= rule ? rule.type : null;
		var index	= (rule ? rule.index : null) || this.sortIndex;
		
		// Try to auto-detect
		if(!type) {
			if(/[0-9]+$/.test(input)) {
				type = 'numeric';		
			} else  {
				type = 'string';
			}
		}
		
		// Initialize cells
		if(!this.options.useCache) {
			this.cells = {};
		}
		 
		
		
		return function(a, b) {
			var _fn		= rule ? rule.fn : null;
			if(_fn) {
				type = 'numeric';	
			}
			
			var _aCell 	= $(a.cells[index]);
			var _bCell 	= $(b.cells[index]);		
			
			var _a = this.cells[_aCell.uniqueID] = this.cells[_aCell.uniqueID] || ( _fn ? _fn(_aCell) : _aCell.getText());
			var _b = this.cells[_bCell.uniqueID] = this.cells[_bCell.uniqueID] || ( _fn ? _fn(_bCell) : _bCell.getText());

			if(type === 'numeric')  {
				return parseInt(_a) - parseInt(_b);
			}  if( type === 'float') {
					return parseFloat(_a) - parseFloat(_b);
			}	else {
				// String
				// TODO: add more
				_a = _a.toLowerCase(); _b = _b.toLowerCase();
				return _a === _b ? 0 : (_a < _b ? -1 : 1);
			}
		}.bind(this);
	},

	sort: function(cell, mode) {
		// Ingore it if null
		if(typeof cell == 'number') {
			cell = this.theadCells[cell];
		}
		var rule	= this.options.cellRules[cell.cellIndex];
		if(rule === null) {
			return false;
		}		
		
		if(this.isSorting) {
			return this;	
		}
		this.prevCell	= this.cell;
		
		mode = cell.mode || mode;
		this.invokeEvent('start');
		this.isSorting	= true;
		
		this.rows 		= $A(this.tbody.rows); // [].slice.call(this.tbody.rows, 0)
		
		this.sortIndex 	= cell.cellIndex
		
		this.rows.sort(this.compare.call(this, $(this.rows[0].cells[this.sortIndex]).getText()));
		
		if(mode === 'asc') {
			this.rows.reverse();	
		}

		this.rows.each(function(row) {
			$(row).injectIn(this.tbody);					
		}, this);
		
	
		if(this.prevCell) {
			
			$(this.prevCell).
			removeClass('sort-asc').
			removeClass('sort-desc');
			
		
		}
		
		
		
		
		cell.addClass('sort-'+mode);
		this.cell		= cell;
		this.isSorting	= false;
		
		
		return this.invokeEvent('sort',this.sortIndex, mode, cell);
	}
}).implement(new Options, new Events);
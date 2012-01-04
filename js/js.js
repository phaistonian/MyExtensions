Ext = {
	//interval	: ( 5 * 60 ) * 1000, 	// Update interval 5 mins
	extensions	: {},
	debug		: false,
	localTest	: false,
	maxRank		: 1000,
	'keys'		: {
		'shift'	: false
	},
	XHR			: {},
		
	intervals 	: {
		//'1'	: '1 min',
		//'5'	: '5 mins',
		//'10'	: '10 mins',
		'15'	: '15 mins',
		'30'	: '&#189; hour',
		'45'	: '45 mins',
		'60'	: '1 hour',
		'120'	: '2 hours',
		'-1'	: '-- disabled'
	},
			
	tips		:  [
		'Hold down SHIFT when clicking to an extension\'s link in order to quick download/install the extension',
		'Click the pencil icon to go to extension\'s edit page.',
		'Columns are sortable.',
		'You can set the update interval in the options page.',
		'When an extension is updated within the last 10 hours, a NEW sign will show up in the extension row.',
		'Use  "<a href="http://bit.ly/7iEMXv" target="_blank" title="My Alerts extension">My Alerts</a> to track your extensions on Twitter, Google and Backtweets results.'
	],

	inPopup		: location.href.indexOf('popup') 		!== -1,
	inOptions	: location.href.indexOf('options') 		!== -1,
	inBg		: location.href.indexOf('background') 	!== -1,

		
	initialize	: function(force) {
		this.load();	
		var tableContainer 	= $('table-container');
		
	
		
		if(this.inOptions) {
			$('wrapper').style.marginLeft = $('wrapper').style.marginRight ='auto';
			tableContainer.setHTML('<h3 style="position: absolute; top: 1px; left: 0px;">My Extensions &rarr; Options</h3><table class="table-options" style="display:'+(this.getTotal() >0 ? 'auto' : 'none')+'" border="0" cellspacing="0" id="table" summary="myExtensions"><thead><th colspan="2">Extension</th><td>Remove</td></tr></thead><tbody></tbody></table>');
			this.checkExtensionsCount();
			
			// Add some handlers
			var checkboxes	= Array.prototype.slice.call(document.body.getElements('input[type="checkbox"]'));
			var options  	= this.options;
			checkboxes.each(function(checkbox, index) {
				checkbox.addEventListener('change', function(event) {
					if(checkbox == checkboxes[0]) {
						options.notify.ratings = !!checkbox.checked
					}
					
					if(checkbox == checkboxes[1]) {
						options.notify.comments = !!checkbox.checked
					}
					
					if(checkbox == checkboxes[2]) {
						options.desktop.ratings = !!checkbox.checked
					}
					
					if(checkbox == checkboxes[3]) {
						options.desktop.comments = !!checkbox.checked
					}

										
									
					if(checkbox == checkboxes[4]) {
						options.compact = !!checkbox.checked
					}
					
					
					localStorage['options'] = JSON.stringify(options);
					
				}, false);
			});
			
			// Quick n' dirty
			if(!this.options.desktop) {
				this.options.desktop = {
					'comments' 	: true,
					'ratings'	: false
				}
			}
			
			if(this.options && this.options.notify) {
				if(this.options.notify['ratings']) {
					checkboxes[0].checked = true;
				}
				
				if(this.options.notify['comments']) {
					checkboxes[1].checked = true;
				}
				
				if(this.options.desktop['ratings']) {
					checkboxes[2].checked = true;
				}
				
				if(this.options.desktop['comments']) {
					checkboxes[3].checked = true;
				}

								
			}
			
			if(this.options && this.options.compact) {
				checkboxes[4].checked = true;
			}
			
			// Interval
			var interval 	= document.getElementById('interval');

			// Handle (ignore from)
			var handle		= document.getElementById('field-handle');
			handle.addEventListener('keyup', function() {
				options.ignoreFrom = handle.value.trim();
				localStorage['options'] = JSON.stringify(options);
			}, false);
			
		
			if(this.options.ignoreFrom) {
				
				handle.value = this.options.ignoreFrom;
			}

			var html 		= [];
			for(var value in this.intervals) {
				html.push ('<option '+(this.options.interval == value ? ' selected' : '') + ' value="'+value+'">'+this.intervals[value]+'</option>');
			}
			interval.innerHTML = html.join('');
			interval.addEventListener('change', function(event) {
				options.interval = interval.value;
				localStorage['options'] = JSON.stringify(options);
				
				Ext.Bg.interval()
			});
		}
		

			
		
		if(!this.extensions || this.getTotal() === 0) {
			if(this.inPopup) {
				//tableContainer.setHTML('<div id="empty"><h3>Aw Snap!</h3><p>It seems, you have not defined your extensions yet.</p><p>Go to the <a href="'+chrome.extension.getURL('options.hml')+'" target="_blank" title="Options">options page</a> to add them.</p></div>');
				tableContainer.setHTML('<div id="empty"><h3>Aw Snap!</h3><p>It seems, you have not defined your extensions yet.</p><p>Go to the <a href="javascript:void(0)" onclick="chrome.tabs.create({url:\'chrome-extension://\'+location.hostname+\'/options.html\'})">options page</a> to add them.</p></div>');
			}
		} else {
			if(this.inPopup) {
				
				if(this.options.compact) {
					document.body.className = 'compact';
				}

				tableContainer.setHTML('<div id="top-left"><a href="https://chrome.google.com/webstore/developer/dashboard"  target="_blank" title="Developer Dashboard (Gallery)" id="link-dashboard">Dashboard</a><a href="https://chrome.google.com/webstore/detail/igejgfmbjjjjplnnlgnbejpkpdajkblm" target="_blank" title="Feedback and reviews" id="link-feedback">Feedback</a></div><div id="top-right"><a href="javascript:void(0)"  onclick="chrome.tabs.create({url:\'chrome-extension://\'+location.hostname+\'/options.html\'})" title="Extension options" id="link-options">Options</a> <span id="link-extensions" class="foo" onclick="chrome.tabs.create({url: \'chrome://settings/extensions/\'});" title="chrome://settings/extensions/">Extensions</span></div><table border="0" cellspacing="0" id="table" summary="myExtensions">' + 
				(!Ext.options.compact ? 
				'<thead class="thead-top"><tr><th class="cell-img"></th><th class="cell-link">&nbsp;</th><td colspan="2" class="cell-thead-asof"><dfn id="ranks-updated" title="As of: ' + Ext.getTime(Ext.ranksUpdated * 1000) + '">out of <span id="total-extensions">'+(Ext.totalExtensions || 0).toFormatted()+'</span></dfn></td><td class="cell-users"><span id="total-users">'+(Ext.getTotalUsers())+'</span></td><td class="cell-installs"></td><td class="cell-ratings"></td><td class="cell-ratings-total"></td><td class="cell-comments"></td></tr></thead>' : '' ) +
				
				(!Ext.options.compact ? 
				'<thead><th class="cell-img"></th><th class="sort sort-asc cell-link">Extension or Theme</th><td class="cell-rank-popularity sort">Popularity</td><td class="cell-rank-rating sort">Ranking<td class="cell-users sort"><dfn title="(Weekly) Computed from update pings in the last week">Users</dfn></td><td class="cell-installs sort"><dfn title="Number of installs in the last week">Installs</dfn></td><td colspan="2" style="text-align: center; sort" class="sort cell-thead-ratings">Ratings</td><td class="cell-comments sort"><img src="img/cell-feedback.png" /></td></tr></thead>'  : 
				'<thead><th class="cell-img"></th><th class="sort sort-asc cell-link">Extension or Theme</th><td colspan="2" style="text-align: center;width: 135px;" class="sort cell-thead-version">Version</td><td colspan="2" style="text-align: center;" class="sort cell-thead-ratings">Ratings</td><td class="cell-comments sort"><img src="img/cell-feedback.png" /></td></tr></thead>' ) +
				
				
				'<tbody></tbody></table><span id="update"><div style="color: #999;overflow: hidden;margin-top: 10px;"><span style="float: left;"><button onclick="Ext.Bg.update()" title="Update extensions now" id="update-now">update now</button>  <span class="foo" id="mark" onclick="Ext.seen()">Reset badges</span></span><div style="float: right; margin-top: 5px;">' + (!Ext.options.compact && this.options.interval != -1 ? 'Auto updates every '+this.intervals[this.options.interval]+' - ' : '') +  '<span id="last-updated"></span></div></div><div id="tip">TIP: '+Ext.tips[ Math.floor(Math.random() * Ext.tips.length) ]+'</div>');
				
				// Nifty trick ;p
				var limit =  this.options.compact ?  15 : 10;
				if(this.getTotal() > limit  ) {
					$('wrapper').style.marginRight = '20px';
				}
				
				
				// ADDED: 01.NOE.010
				if(screen.height < 800) {
					$('wrapper').style.maxHeight = (screen.height - 50 - 40) + 'px';
					$('wrapper').className = 'overflow';
				}

				
				var sorters = {
					'ranks' : function(cell) {
						var value = cell.textContent.replace(/NEW/, '');
						if(value.indexOf('>') != -1) {
							value = 99999;
						}
					
						return parseInt(value);						
					},
					
					'generic' : function(cell) {

						return parseInt(cell.textContent.replace(/,/ , ''));
					},
					
					'float'	: function(cell) {
						return parseFloat(cell.textContent.replace(/NEW/, ''));
					},
					
					'v'		: function(cell) {
						return parseInt(cell.getAttribute('v'));
					}
				}
						
				if(!Ext.options.compact) {
					Ext.tableSort = new TableSort(document.getElementsByTagName('table')[0], {
						'theadIndex' 		: 1,
						'onSort'			: function(index, mode, cell) {
							localStorage['sort'] = JSON.stringify({
								'index' : index,
								'mode'	: mode
							});
							
						},
						'cellRules'			: {
							'0'	: null,
							'2'	: {
								'fn' : sorters['ranks']
							},
	
							'3'	: {
								'fn' : sorters['ranks']
							},
							
							'4'	: {
								'fn' : sorters['generic']
							},
							
							'5'	: {
								'fn' : sorters['generic']
							},
							
							'6'	: {
								'fn' 	: sorters['decimal'],
								'type'	: 'float'
							},
	
							'7'	: {
								'index'	: 8, // different
								'fn' 	: sorters['generic']
							}
						}					
					});
					
				} else {
					Ext.tableSort = new TableSort(document.getElementsByTagName('table')[0], {
						'theadIndex' 		: 0,
						'onSort'			: function(index, mode, cell) {
							localStorage['sort'] = JSON.stringify({
								'index' : index,
								'mode'	: mode
							});
							
						},
						'cellRules'			: {
							'0'	: null,
							'2'	: {
								'fn' : sorters['v']
							},
	
							'3'	: {
								'index'  : 4,
								'fn' 	: sorters['decimal'],
								'type'	: 'float'
							},
							
							'4'	: {
								'index' : 6,
								'fn' : sorters['generic']
							}
						}					
					});				
							
				}
				
				//console.log(localStorage['sort']);
				
				//	console.log( Ext.tableSort.thead.getElements('td,th') );
				//window.onload = function() { Ext.tableSort.sort(3) }
			
			}
			
			
			
			each(Ext.extensions, function(data, hash)	 {
				new Ext.Extension(hash);
			});
				
		}
	
	
		// Popup only
		if(this.inPopup) {
			window.addEventListener('keydown', function(event) {
				switch(event.keyCode) {
					case 16:
						Ext.keys.shift 	= true;
						break;
					case 18:
						Ext.keys.alt 	= true
						break;
					case 17:
						Ext.keys.ctrl 	= true;
						break;
				}
				
				// Toggle = ctrl+shift+r OR ctrl+shift+f5
				if(Ext.keys.ctrl && Ext.keys.shift && (event.keyCode === 114 || event.keyCode === 82)) {
					Ext.toggle();
				}
				
				//Ext.restart();	
				
			});
			
			
			window.addEventListener('mouseup', function(event) {
				// Reset keys // CHANGED 14.1.2010
				// Ext.keys.shift = Ext.keys.alt = Ext.keys.ctrl = false;
				// Ext.restart();	
			});
				
			window.addEventListener('keyup', function(event) {
				switch(event.keyCode) {
					case 16:
						Ext.keys.shift 	= false;
						break;
					case 18:
						Ext.keys.alt 	= false
						break;
					case 17:
						Ext.keys.ctrl 	= false;
						break;
				}
			});		
			


			chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
				if(req.action) {
					if(req.action === 'update') {
						
						var extension = Ext.extensions[req.instance.hash];
						if(!extension) {
							return this;
						}
						
						$extend(extension, {
							'title'		: req.instance.title,
							'users'		: $merge(req.instance.users),
							'ranking'	: $merge(req.instance.ranking),
							'installs'	: $merge(req.instance.installs), // weekly
							'updated'	: req.instance.updated,
							'ratings'	: $merge(req.instance.ratings),
							'comments'	: $merge(req.instance.comments),
							'version'	: req.instance.version,
							'versionDT'	: req.instance.versionDT,
							'author'	: req.instance.author,
							'img'		: req.instance.img						
						});
						
						
						if(Ext.inPopup) {
							Ext.extensions[req.instance.hash]['update']();
							Ext.extensions[req.instance.hash].handleComments().handleRatings();
						}
					}
					
					if(req.action === 'updateStart') {
						Ext.updateStart();
					}
					
					if(req.action === 'updateProgress') {
						if($('update-now')) {
							this.step	= req.step;
							this.total 	= req.total;
							Ext.updateProgress(req.step, req.total);
						} else {
							return this;
						}
					}
				}
			});
		
			
			!this.inOptions && this.updateTS();		
		}
		
	
		
		/* Apply tool tips here */
		if(Ext.inPopup) {
			Ext.tooltips = {
				'plain'				: [],
				'comments'			: {},
				'ratings'			: {},
				'users'				: {},
				'rank.popularity' 	: {},
				'rank.rating'		: {}
			};
			
			// Plain irst
			if( 0 )
			document.body.getElements('thead dfn').each(function(element, index) {
				Ext.tooltips['plain'].push(new Tooltip(element, element.title.replace(/\n/gi, '<br />') ) );
			});
			
			// Delayed is better
			(function() {
				
				/*
				document.body.getElements('tbody .cell-ratings').each(function(element, index) {
					
					Ext.tooltips['ratings'][element.title] = new Tooltip(element, Ext.extensions[element.title].getStarsHTML());
				});
				*/
				
				document.body.getElements('tbody .cell-comments').each(function(element, index) {
					Ext.tooltips['comments'][element.title] = new Tooltip(element, Ext.extensions[element.title].getCommentsHTML(), {
						'dontCloseOnElement'	: true
					});
				});		
				
			
				document.body.getElements('tbody .cell-rank-popularity').each(function(element, index) {
					Ext.tooltips['rank.popularity'][element.title] = new Tooltip(element, Ext.extensions[element.title].getGraph('popularity', element));
				}, this);	
				
	
				document.body.getElements('tbody .cell-rank-rating').each(function(element, index) {
					Ext.tooltips['rank.rating'][element.title] = new Tooltip(element, Ext.extensions[element.title].getGraph('rating', element));
				}, this);
				
				
				// NOT FOR NOW!
				if(0)
				document.body.getElements('tbody .cell-users').each(function(element, index) {
					Ext.tooltips['users'][element.title] = new Tooltip(element, Ext.extensions[element.title].getGraph('users', element));
				}, this);				
				
			}).delay(500, this);


			
		}
				
		
		return this;
	},
	
	install			: function(hash, event) {
		var url ='https://clients2.google.com/service/update2/crx?response=redirect&x=id%3D'+hash+'%26uc%26lang%3D'+navigator.language+'&prod=chrome&prodversion='+navigator.appVersion.match(/Chrome\/(.*?) /)[1];
		
		
		if(1) {
			chrome.tabs.create({
				'url' : url,
				'selected' : false
			}, function(tab) {
				var fn = function(tabId) {
					chrome.tabs.remove(tabId);
				}
				
				chrome.tabs.onUpdated.addListener(function(tabId, info) {
					if(tabId == tab.id) {
						if(info.status == 'complete') {
							fn(tabId);
						}							
						chrome.tabs.onUpdated.removeListener(fn);
					}
				});					
			});
		}		
		
		return this;
	},
	
	// Reset and hide badges
	seen			: function(hash, event) {
		// Clicking
		if(event && Ext.keys.shift) {
			event.stopPropagation();
			event.preventDefault();
			
			this.install(hash,event);			

			
			if(0)
			location.href = url;
//			window.location.href = 'https://clients2.google.com/service/update2/crx?response=redirect&x=id%3D'+hash+'%26uc%26lang%3D'+navigator.language+'&prod=chrome&prodversion='+navigator.appVersion.match(/Chrome\/(.*?) /)[1];
			
			// Just to make sure
			Ext.keys.shift = null;
			return false;
		}
		
		var left 			= false;
		var extension		= hash ? this.extensions[hash] : null;
		
	
		
		if(extension) {
			extension.comments['new'] = extension.ratings['new']  = false;
			extension.elements.ratingsBadge.hide();
			extension.elements.commentsBadge.hide();
		}
		
		// Any left?	
		each(this.extensions, function(ext) {
			if(!hash) {
				ext.comments['new'] = ext.ratings['new']  = false;
				ext.elements.ratingsBadge.hide();
				ext.elements.commentsBadge.hide();
			} else {
				left					= left || ext.comments['new'] || ext.ratings['new'];
			}
		});
		
		
		
		if(!left) {
			this.hideBadge();
			if($('mark')) {
				$('mark').hide();
			}
		}
		
		
		Ext.store(true);
		
		//Ext.Bg.reload();		
		

				
	
		return true;
	},
	
	shouldGetRatings	: function() {
		// LET IT BE TRUE AT ALL TIMES FOR NOW
		var result = true;
		
		each(this.extensions, function(extension) {
			if(!extension.ranksFetched) {
				result = true;
			}
		});
	
		if(!result && Ext.ranksUpdated) {
			var diff = (new Date().getTime() - (Ext.ranksUpdated * 1000) ) / 1000;	
			if(diff > 3600 * 2) {
				result = true;
			}
		}		

		return result;
	},
	
	
	
	hideBadge		: function() {
		chrome.browserAction.setBadgeText({
			'text' : ''
		});
		
		return this;
	},
	
	showBadge		: function(mode) {
		chrome.browserAction.setBadgeText({
			'text' : 'NEW'
		});
		
		chrome.browserAction.setBadgeBackgroundColor({
			'color'	 : (mode !== 'ratings' ? [255, 0, 0, 255] : [255,102,0, 255])
		})
		
		return this;
	},
	
	// Check if this url is one of any of the extensions
	scanURL				 : function(url) {
		alert(url);
		each(this.extensions, function(extension, hash) {
			if(url.indexOf(hash) !== -1) {
				alert(0);
				//extension.resetComments();
			}
		});
	},
	
	getTotalUsers		: function() {
		var total 	= 0;
		var cnt 	= 0;
		for(var i in this.extensions) {
			cnt ++;
		//	this.extensions.each(function(ext, index) {
			total += this.extensions[i].users.total || 0;
		};
		
		// Not for just 1:)
		return cnt > 1 ? total.toFormatted(0) : '';
	},
	
	getTime				: function(ts) {
		if(!ts)	 {
			return 'N/A';
		}
		ts = parseInt(ts)
		var dt = new Date(ts);

		return [dt.getHours().pad(2), dt.getMinutes().pad(2)].join(':');
	},
	
	checkExtensionsCount : function() {
		if(!this.inOptions) {
			return false;
		}
		var total = this.getTotal();
		if(total) {
			$('empty').hide();
			$('table').style.display = 'table';
		} else {
			$('empty').show();
			$('table').hide();
		}
		
		return this;
	},	
	
	load		: function() {
		this.extensions			= this.options = null;
		
		this.extensions			= localStorage['data'] ? JSON.parse(localStorage['data']) : {};
		
		this.username			= localStorage['username'] || '';
		
		this.options			= localStorage['options'] ? JSON.parse(localStorage['options']) : { 'desktop' : { 'comments' : true, 'ratings' : false}, 'notify' : { 'comments': true, 'ratings' : true}};
		this.totalExtensions	= localStorage['totalExtensions'] ? parseInt(localStorage['totalExtensions']) : 0;
		
		//this.ranksUpdated		= localStorage['ranksUpdated'] ? parseInt(localStorage['ranksUpdated']) : 0;
		// Keep it to zero for now
		this.ranksUpdated		= 0;
		
		this.options.interval	= (!this.options.interval || (this.options.interval > -1 && this.options.interval < 15)) ? 15 : this.options.interval;
			
		if(this.extensions)	{
			// Sort extensions
			var sorted  		= {};
			var sortTempArray 	= [];
			each(this.extensions, function(extension) {
				// A hack for debug;
				if(extension.hash === 'plnemfhpneldfafgllajkpcbflmkfkjd') {
					Ext.debug = true;
				}
				sortTempArray.push(extension);
			});
			
				
	
			
			var sortfn  = function(a, b) {
				if(a && a.title && b && b.title) {
					var first = a.title.toLowerCase(); second = b.title.toLowerCase();
					return first === second ? 0 : (first < second ? -1 : 1);			
				} else {
					return false;
				}
			}
			
			sortTempArray.sort(sortfn)
			var self = this;
			sortTempArray.each(function(extension) {
				sorted[extension.hash] = extension;
			}, this);
			
	
			this.extensions = sorted;
			
			// Needed
			sorted 			= sortFn = null;
			sortTempArray 	= null;
		}		
		
		// For starters
		Ext.hideBadge();
		
		// Stupido
		each(this.extensions, function(extension) {
			if(extension['comments']['new'] && Ext.options.notify.comments ) {
				// IgnoreFrom goes here
				if(extension.comments.latest && (extension.comments.latest.entity.nickname != Ext.options.ignoreFrom )) {
					Ext.showBadge('comments');
				}
			}
			if(extension['ratings']['new'] && Ext.options.notify.ratings ) {
				Ext.showBadge('ratings');
			}
			
			// Desktop notifications handlers
			if(!Ext.options.desktop) {
				Ext.options.desktop = {
					'comments' : true
				}
			}
			if(extension['comments']['new'] && Ext.options.desktop.comments ) {
				if(extension.comments.latest && extension.comments.latest.entity && ( (Ext.inBg && !Ext.bgDone) || (extension.desktopNotified != extension.comments.latest.timestamp) )) {
					if(extension.comments.latest.entity.nickname != Ext.options.ignoreFrom) {
						new Ext.Notification((extension.comments.latest && extension.comments.latest.comment ? extension.comments.latest.comment : 'N/A'), 'New review for ' + extension.title + ' (from '+ (extension.comments.latest.entity.nickname || 'Anonymous') +')');
					}
					
					// Timestamp instead
					extension.desktopNotified = extension.comments.latest.timestamp;
					Ext.store();
				}
			}
			
			// TODO: 2beimplemented!
			// if(extension['ratings']['new'] && Ext.options.desktop.ratings ) {
			// 	Ext.showBadge('ratings');
			// }			
			
		});
		
		
		
		return this.extensions;
	},
	
	
	// This should be called JUST once
	// Whenever we store > update something
	store		: function(justStore) {
		var toStore				= {};
		var extension, value;
		for(var id in this.extensions) {
			extension 	= this.extensions[id];
			toStore[id] = {};
			
			for(var key in extension) {
				value = extension[key];
				if(value && key !== 'XHR' && key !== 'elements' && typeof(value) !== 'function' && !value.nodeName) {
					toStore[id][key] = value;
				}
				
				//toStore[id]['comments']['new'] = true;
			}
			
			Ext.updated = toStore[id]['updated']= new Date().getTime();
		}
		
	
		localStorage['data']			= JSON.stringify(toStore);
		localStorage['totalExtensions']	= this.totalExtensions;
		localStorage['ranksUpdated']	= this.ranksUpdated;
		localStorage['username'] 		= Ext.username || localStorage['username'];
		
		toStore = null;
			
		Ext.Bg.reload();
		
		if(justStore) {
			return this;
		}
			
		Ext.sendRequest({
			'action' : 'updateProgress',
			'step'	 : this.step 	|| 0,
			'total'	 : this.total 	|| 0
		});

		
		//Ext.Bg.reload();
		
		// Enable it back
		this.addEnable();
		
				
		return this;
	},
	
	updateTS	: function() {
		if(!this.inPopup || !$('last-updated')) {
			return false;	
		}
		
				
		if(!this.updated && this.extensions) {
			each(this.extensions, function(extension) {
				Ext.updated = extension.updated;
			});
		} else {
			this.updated = new Date().getTime();	
		}
		
		
		
		var date = new Date(this.updated);
		$('last-updated').setHTML('Updated: ' + [date.getHours().pad(2), date.getMinutes().pad(2)].join(':'));
		
		return this;
	},
	
	getTotal	: function() {
		var total = 0;
		each(this.extensions, function() {
			total++;
		});
		
		return(this.total = total);
	},

	updateStart : function() {
		this.step			= 0; // Hold update progress
		this.total			= this.getTotal();
				
		var button 			= $('update-now');
		if(button) {
			button.disabled	 = true;
			button.innerHTML = 'Updating, please wait';
		}	
		
		return this;
	},
	
	updateProgress	: function(step, total) {
		this.updateTS();	
		
		this.step++;
			
		var actions = 3;
		if(!Ext.shouldGetRatings()) {
			actions = 2;
		}
	
		var percent = Math.round( (100 * this.step) / (this.getTotal() * actions) ).pad(2);	
		
		// Store it
				
		if(percent >= 100 ) {
			(function() {
				$('update-now').disabled = false;
				$('update-now').setHTML ('Update now');
			}).delay(750, this);
		}
		
		// ADDED: percent < 101 13.3.2010
		if(percent && !isNaN(percent) && percent < 101) {
			if($('update-now')) {
				$('update-now').innerHTML = 'Updating (' + ( percent)+ '%)';
			}
		}
		
		return this;
	},
	
	update			: function() {
		Ext.sendRequest({
			'action' : 'updateStart'
		});
			
		each(this.extensions, function(extension) {
			extension.getMeta();
		});
		
		if(this.inBg) {
			if(this.timer) {
				this.timer - $clear(this.timer)
			}
			
			// console.log('UPDAtING - ' + this.options.interval);
			if( parseInt(this.options.interval) !== -1) {
				this.timer 	= this.update.delay(parseInt(this.options.interval) * 1000 * 60, this);
			}
			
		}
		
		return this;
	},
	
	addDisable	: function() {
		if(this.inOptions) {
			$('button').disabled 	= true
			$('button').innerHTML = 'Please wait ...';
		}
		
		return this;
	},
	
	addEnable	: function() {
		if(this.inOptions) {
			$('button').disabled 	= false;
			$('button').innerHTML = '+ Add';
		}
		
		this.checkExtensionsCount();
		
		return this;
	},
	
	exists		: function(hash) {
		return this.extensions && !!this.extensions[hash];	
	},
	
	find		: function() {
		var found 		= [];
		var username 	= window.prompt('Please enter your Google username (e.g phaistonian).\n(The one you used to add your extensions to the Gallery)', Ext.username && Ext.username !== 'undefined' ? Ext.username : '');
		if(!username) {
			return;
		}
		
		// Store it here
		localStorage['username'] = Ext.username = username;
		
		new Ajax({
			'method'	: 'GET',
			'url'		: 'https://chrome.google.com/extensions/search?q=' + username + '&source=igejgfmbjjjjplnnlgnbejpkpdajkblm',
			'onSuccess' : function(xhr) {
				var dump = xhr.responseText;
				if(!dump) {
					alert('Network error, can not retrieve content. Please try again later.');
					return;
				}
				var reg 		= new RegExp('<h2>.*?detail/([\\s\\S]*?)"', 'gi');
				var matches 	= dump.match(reg);
				
				if(matches && matches.length) {
					matches.each(function(match, index) {
						var extension = match.match(/detail\/(.*?)"/i);
						if(extension[1]) {
							if(!Ext.exists(extension[1])) {
								Ext.add(extension[1]);
							}
						}
						
					});
				} else {
					alert('No extension found for given account');
				}
			}
		}).send();
		
		return this;
	},
	
	add			: function(hash) {
		$('hash').value			 = '';
		hash					= hash.trim();
		
		if(hash.length != 32) {
			alert('Invalid extension hash given (must be 32 chars');
			$('hash').focus();
			return;
		}
		
		if(Ext.exists(hash) && Ext.extensions[hash].title) {
			alert('Extension is already set.');
			$('hash').focus();
			return;
		}
		
		return new Ext.Extension(hash);		
	},
	
	remove		: function(hash) {
		this.extensions[hash].remove();
		return this;
	},
	
	sendRequest	: function(obj) {
		var instance = {};
		if(obj.instance) {
			for( var key in obj.instance) {
				if(typeof (obj.instance[key]) != 'function') {
					instance[key] = obj.instance[key];
				}
			}
			
			obj.instance = instance;
		}
		
		chrome.extension.sendRequest(obj);
		return this;
	}	
}




















// Class
Ext.Extension = new Class({
	initialize	: function(hash) {
		this.hash				= hash;
		if(Ext.extensions[hash]) {
			$extend(this,Ext.extensions[hash]);
			
			this.ratings 	= this.ratings || {
				'total' 			: 0,
				'average' 			: 0,
				'previousAverage' 	: null,
				'stars'				: null,
				'previous'			: null,
				'new'				: false
			}
			
			this.comments	= this.comments || {
				'total'				: 0,
				'previous'			: null,
				'latest'			: {},
				'latestPrevious' 	: {},
				'new'				: false
			} 
			
			this.ranking	= this.ranking || {
				'total'			: null,
				'popularity'	: null,
				'rating'		: null,
				'ts'			: null
			}
			
			this.installs	= this.installs || {
				'total'		: 0,
				'previous'	: null
			}
			
			
			this.users		= this.users || {
				'total'		: 0,
				'previous'	: null				
			}
			
			Ext.extensions[hash] = this;
			
				
				if(Ext.inPopup) {
				if(this.comments['new'] || this.ratings['new'] ){
					
					$('mark').style.display = 'inline';
				}
			}
				

			
			return this.renderElement();
		} else {
			Ext.addDisable();

			this.ratings 	= this.ratings || {
				'total' 	: 0,
				'average' 	: 0,
				'previousAverage' : null,
				'previous'	: null,
				'new'		: false
			}
			
			this.comments	= this.comments || {
				'total'		: 0,
				'previous'	: null,
				'latest'	: {},
				'new'		: false
			} 
			
			this.installs	= this.installs || {
				'total'		: 0,
				'previous'	: null
			}
			
			
			this.users		= this.users || {
				'total'		: 0,
				'previous'	: null				
			}
	
			this.ranking	= {
				'total'			: null,
				'popularity'	: null,
				'rating'		: null,
				'ts'			: null
			}
	
			Ext.extensions[hash] = this;
				
			return this.getMeta();
		}
		
		return this;
	},
	
	// Store to localStorage
	// Skip functions
	store		: function() {
		var toStore = {};
		each(Ext.ex)
		
		
		return this;
	},
	
	remove		: function() {
		delete(Ext.extensions[this.hash]);
		if($('row-' + this.hash)) {
			$('row-' + this.hash).remove();			
		}
		Ext.store();
		Ext.Bg.reload();
		
		return this;
	},
	

	update		: function() {
		
		if(Ext.inPopup || Ext.inOptions) {
			
			if(!this.elements) {

				this.renderElement();
				
			} else if(Ext.inPopup) {
				
				if(Ext.totalExtensions) {
					if($('total-extensions')) {
						$('total-extensions').innerHTML = Ext.totalExtensions.toFormatted();
					}
					//.toFormatted();
				}
				
				
				
							
				if(Ext.ranksUpdated && $('ranks-updated') ) {
					//$('ranks-updated').title = 'As of: ' + Ext.getTime(Ext.ranksUpdated * 1000);
				}
			
				if($('total-users')) {
					$('total-users').innerHTML = Ext.getTotalUsers();
				}
				//if()
			

				this.elements.title.setHTML(this.title);
			
				//this.elements.img.style.backgroundImage = this.img;
				this.elements.img.src = this.img;
				
				
				//var versionDt = this.versionDT ? ', ' + this.versionDT : '';
				var versionDT = '', date, today = new Date(), now = today.getTime(), diff, hour = today.getHours(), isNew = '';
				if(this.versionDT) {
					date = new Date(parseInt(this.versionDT*1000));
					diff = now - date.getTime();
					
					
					
					if( diff  < (hour * (3600 * 1000)) ) {
						versionDT = ', Today'
					} else 	if( ( diff > hour * (3600 * 1000) ) && ( diff < (hour + 24)  * (3600 * 1000 )) )  {
						versionDT = ', Yesterday'
					} else {
						versionDT = ', ' + Math.round(diff / (86400 * 1000)) + ' days'
					}
					
					// New (updated)
					if(diff < 3600 * 1000 * 12) {
						isNew = ' <span class="new">(NEW)</span>'
					}
				}
				
				
				if(!Ext.options.compact) {
					this.elements.version.setHTML('V: ' + this.version + isNew + (versionDT ? '<dt>' + versionDT + '</dt>' : '') );
					this.elements.popularity.setHTML( this.ranking.popularity > 0 && this.ranking.popularity < 999999 ? this.ranking.popularity.toFormatted() : '>' + Ext.maxRank );
					this.elements.rating.setHTML(this.ranking.rating > 0 && this.ranking.rating < 999999  ? this.ranking.rating.toFormatted() : '>' + Ext.maxRank);
					this.elements.users.setHTML((this.users.total || 0).toFormatted(','));
					this.elements.installs.setHTML((this.installs.total || 0).toFormatted(','));
				}  else {
					
					this.elements.versionDT.setHTML(versionDT.replace(/, /, ''));
					this.elements.versionDT.setAttribute('v', parseInt(this.versionDT*1000) );
					
					this.elements.version.setHTML('('+this.version+')');
					
				}
				
				var html	= (this.ratings.average || 0).toFixed(2),
					_class	= '',
					title	= 'no change',
					ret;
				diff = Number(((this.ratings && this.ratings.previousAverage) ? this.ratings.average - this.ratings.previousAverage : 0).toFixed(2));

				if (diff) {
					_class	= diff > 0 ? ' up' : ' down';
					title	= ((diff > 0) ? '+' : '') + diff;
				}

				// NOT FOR NOW
				if (0) {
					if (ret = this.getStars()) {
						html = '<div title="'+ret+'">'  + html + '</div>';
					}
				}  else {
					html = '<div>' + html + '</div>';
				}

				/*
				if(Ext.tooltips['ratings'][this.hash]) {
					Ext.tooltips['ratings'][this.hash].setContent(this.getStarsHTML() );
				}
				*/

				if(Ext.tooltips['comments'][this.hash]) {
					Ext.tooltips['comments'][this.hash].setContent(this.getCommentsHTML() );
				}

				this.elements.ratingsAverage.className = 'cell-ratings' + _class;
				this.elements.ratingsAverage.title = title;
				this.elements.ratingsAverage.setHTML(html);
				this.elements.ratingsTotal.setHTML('('+this.ratings.total.toFormatted(',') +')');
				
				/*
				var html =  0 && this.comments.latest && this.comments.latest.entity ? '<dfn title="Latest from '+ (this.comments.latest.entity.nickname || 'Anonymoys') + ':\n' + this.comments.latest.comment.replace(/"/gi, '&quot;')+'">'+this.comments.total.toFormatted(',') + '</dfn>' : this.comments.total.toFormatted(',');
				*/
				html = this.comments.total ? '<dfn> ' + this.comments.total.toFormatted(',') + '</dfn>' : '0';
				
				this.elements.comments.setHTML(html);
				
				
				
				if(this.author) {
					this.elements.title.title = 'By ' + this.author;
				}
				return this;	
			}
			
			
			
		}	
		
		return this;
	},
	
	renderElement	: function() {
		if(!Ext.inPopup && !Ext.inOptions) {
			return this;
		}
		
		
		var tbody		= $('table').getElement('tbody');
		var row			= $C('tr');
		var cells;
		var html 		= [];
		
		row.id			= 'row-' + this.hash
		
		if(this.ranking && this.ranking.featured) {
			row.addClass('featured');
		}
		
		
		var versionDT = '', date, today = new Date(), now = today.getTime(), diff, hour = today.getHours(), isNew = '';
		if(this.versionDT) {
			date = new Date(parseInt(this.versionDT*1000));
			diff = now - date.getTime();
			
			
			
			if( diff  < (hour * (3600 * 1000)) ) {
				versionDT = ', Today'
			} else 	if( ( diff > hour * (3600 * 1000) ) && ( diff < (hour + 24)  * (3600 * 1000 )) )  {
				versionDT = ', Yesterday'
			} else {
				versionDT = ', ' + Math.round(diff / (86400 * 1000)) + ' days'
			}
			
			// New (updated)
			if(diff < 3600 * 1000 * 12) {
				isNew = ' <span class="new">(NEW)</span>'
			}			
		}		
		
		if(Ext.inPopup) {
			//html.push('<th class="cell-img"><div class=\"img\"  style="background-repeat: no-repeat; background-position: center top;background-image:'+this.img+'" title="'+this.title+' logo"></div><img src="'+this.img+'" width="20" height="20" /></th>');
			html.push('<th class="cell-img"><div class="img"><img onclick="Ext.install(\''+this.hash+'\')" title="Click to install '+this.title+' extension" alt="" width=\"'+(Ext.options.compact ? 16 : 32)+'\" height=\"'+(Ext.options.compact ? 16 : 32)+'\" src="'+this.img+'"  /></div></th>');
			
			html.push('<th class="cell-link"><div class="link"><a onclick="return( Ext.seen(\''+this.hash+'\', event) )" '+(this.author ? 'title="By '+this.author+'"' : '') + ' href="https://chrome.google.com/webstore/detail/'+this.hash+'" target="_blank">' + this.title + '</a></div><div class="version"><a title="Edit this extension" target="_blank" href="https://chrome.google.com/webstore/developer/edit/'+ this.hash +'">edit</a> <span class="featured">FEATURED ('+(this.ranking && this.ranking.featured ? this.ranking.featured : 0) +')</span><em>V: ' + this.version + isNew + (versionDT ? '<dt>' + versionDT + '</dt>' : '')+'</em></div></th>');
			
			if(!Ext.options.compact) {
				html.push('<td title="'+this.hash+'" class="ranking cell-rank-popularity">' + (this.ranking.popularity > 0 && this.ranking.popularity < 999999  ? Number((this.ranking.popularity || 0).toString().replace(/,/, '').toInt()).toFormatted(',')  : '>' + Ext.maxRank) +  '</td>');
				html.push('<td title="'+this.hash+'" class="ranking cell-rank-rating">' + (this.ranking.rating > 0 && this.ranking.rating < 999999 ? Number((this.ranking.rating || 0).toString().replace(/,/, '').toInt()).toFormatted(',') : '>'+ Ext.maxRank) +  '</td>'); 		
				//html.push('<td class="cell-users" title="'+this.hash+'"><div>' + Number((this.users.total || 0).toString().replace(/,/, '').toInt()).toFormatted(',') +  '</div></td>'); 		
				
				
				var diff 	= this.users && this.users.previous ? this.users.total - this.users.previous : 0;
				var _class	= '';
				var title 	= 'no change';
				if(diff) {
					_class = diff > 0 ? ' up' : ' down';
					title = diff > 0  ? '+' + diff.toFormatted(',') : diff.toFormatted(',');
				}
				
				html.push('<td class="cell-users'+_class+'" title="'+title+'"><div>' + Number((this.users.total || 0).toString().replace(/,/, '').toInt()).toFormatted(',') +  '</div></td>'); 		
				// Installs
				// title="'+(this.installs && this.installs.previous && this.installs.previous != this.installs.total ? 'Was '+this.installs.previous : '')+'"
				html.push('<td class="cell-installs" ><div>' + Number((this.installs.total || 0).toString().replace(/,/, '').toInt()).toFormatted(',') + '</div></td>'); 		// Installs
			} else {
				html.push('<td class="cell-version-dt" v="'+(this.versionDT*1000)+'">' + versionDT.replace(', ', '') + '</td>'); 	// Ratings
				html.push('<td class="cell-version ghost"><div><em>('+this.version+')</em></div></td>');				
			}
			
			
					
			var _html = (this.ratings.average || 0).toFixed(2), ret;

			_class	= '';
			diff	= Number(((this.ratings && this.ratings.previousAverage) ? this.ratings.average - this.ratings.previousAverage : 0).toFixed(2));
			title	= 'no change';

			if (diff) {
				_class	= diff > 0 ? ' up' : ' down';
				title	= ((diff > 0) ? '+' : '') + diff;
			}

			// Not for now 
			if( 0 ) {
				if(ret = this.getStars()) {
					_html = '<div title="'+ret+'">'  + _html + '</div>';
				}
			} else {
				_html = '<div>' + _html + '</div>';
			}
			
			//this.elements.ratingsAverage.setHTML(html);
			
			
			
			html.push('<td class="cell-ratings'+_class+'" title="'+title+'">' + _html + '</td>'); 	// Ratings
			html.push('<td class="cell-ratings-total ghost"><div><em>(' +  (this.ratings.total || 0).toFormatted(',') + ')'   +'</em><span class="ratings-badge"'+(this.ratings && this.ratings['new'] ? ' style="display:block;"' : '')+'>NEW</span></div></td>');
			html.push('<td class="cell-comments" title="'+this.hash+'"><div><strong>' + ( this.comments.latest  && this.comments.latest.entity ? '<dfn>'+(this.comments.total || 0).toFormatted(',') + '</dfn>' : (this.comments.total || 0).toFormatted(',') ) + '</strong><span class="comments-badge"'+(this.comments && this.comments['new'] && (this.comments.latest && this.comments.latest.entity.nickname != Ext.options.ignoreFrom) ? ' style="display:block;"' : '')+'>NEW</span></div></td>'); 		// Comments
			
			
			row.innerHTML = html.join('');
			tbody.appendChild(row);
			//alert(tbody);
			//return this;	
			//row.setHTML(html.join('\n')).injectIn(tbody)
			
			cells			= row.getElements('td');
		
			// Define elements
			if(!Ext.options.compact) {
				this.elements = {
					'row'				: row,
					'img'				: row.getElement('th div.img img'),
					'version'			: row.getElement('th div.version em'),
					'title'				: row.getElement('th a'),
					'popularity'		: cells[0],
					'rating'			: cells[1],
					
					'users'				: cells[2].getElement('div'),
					'installs'			: cells[3].getElement('div'),
					'ratingsAverage'	: cells[4],
					'ratingsTotal'		: cells[5].getElement('div em'),
					'ratingsBadge'		: cells[5].getElement('div span'),
					'comments'			: cells[6].getElement('div strong'),
					'commentsBadge'		: cells[6].getElement('div span')
					
				}
			} else {

				this.elements = {
					'row'				: row,
					'img'				: row.getElement('th div.img img'),
					'title'				: row.getElement('th a'),
					'versionDT'			: row.getElement('.cell-version-dt'),
					'version'			: row.getElement('.cell-version div em'),
					'title'				: row.getElement('th a'),
					'ratingsAverage'	: cells[2],
					'ratingsTotal'		: cells[3].getElement('div em'),
					'ratingsBadge'		: cells[3].getElement('div span'),
					'comments'			: cells[4].getElement('div strong'),
					'commentsBadge'		: cells[4].getElement('div span')
					
				}				
			}
			
			// ARG!
			//this.comments['new']  = false;
			//this.ratings['new']   = false;
				
		}
		else {
			var html 		= ['<th><img src="'+this.img+'" title="'+this.title+' logo" width="16" height="16" /></th>'];
			html.push('<th><div class="link"><a '+(this.author ? 'title="By '+this.author+'"' : '') + ' target="_blank" href="https://chrome.google.com/webstore/detail/'+this.hash+'">' + this.title + '</a></th>');
			//</div><div class="version">V: ' + this.version + (versionDT ? '<dt>' + versionDT + '</dt>' : '')+'</div></th>');
			html.push('<td><em class="foo" onclick="Ext.remove(\''+this.hash+'\')">Remove</em></td>');
			row.setHTML(html.join('\n')).injectIn(tbody)		 	
		 	
		}
			

		return this;
	},

	getMeta		: function () {
		// Without `pv` parameter the actual meta call gets a 441 error
		// response and appears to only accept a specific value, as far as I
		// can tell and using `Math.round((new Date) / 1000)` to generate a
		// similar timestamp didn't work, unfortunately. In an attempt to be
		// future-proof I'm extracting this value from the HTML of the
		// extension's detail page, as this is the only place I can see it is
		// "hard coded".
		Ext.XHR['meta'] = new Ajax({
			'method'	: 'GET',
			'url'		: 'https://chrome.google.com/webstore/detail/' + this.hash + '?source=igejgfmbjjjjplnnlgnbejpkpdajkblm',
			'onSuccess'	: function (xhr) {
				// Multiply by 1000 and you have the following timestamp;  
				// Tue, 13 Dec 2011 17:16:16 GMT  
				// To reduce the risk of breaking things I'm storing the known
				// working value as the default in case it cannot be found.
				var pv = '1323796576',
					responseText = xhr.responseText ? xhr.responseText.trim() : '';

				if (!responseText) {
					if (Ext.inOptions) {
						alert('Unable to retrieve data. Please try again later.');
					}

					this.remove();
					return this;
				}

				var matches = responseText.match(/<script type="text\/javascript" src="\/webstore\/static\/(\d*)\/wall\/js\/webstore.js"><\/script>/i);

				if (matches && matches.length) {
					pv = matches[1];
				}

				this.getActualMeta(pv);

				pv = xhr = responseText = matches = null;
				Ext.XHR['meta'] = null;
			}.bind(this)
		}).send();

		return this;
	},

	getActualMeta: function (pv) {
		Ext.XHR['actualMeta'] = new Ajax({
			'method'		: 'POST',
			'url'			: Ext.localTest ? 'http://192.168.1.200/dump.json' : 'https://chrome.google.com/webstore/ajax/detail?hl=en&pv=' + pv + '&id=' + this.hash + '&source=igejgfmbjjjjplnnlgnbejpkpdajkblm',
			'onSuccess'		: function(xhr) {
				var dirtyPrefix	= ')]}\'',
					response = null,
					responseText = xhr.responseText ? xhr.responseText.trim() : '';

				if (!responseText) {
					if (Ext.inOptions) {
						alert('Unable to retrieve data. Please try again later.');
					}

					this.remove();
					return this;
				}

				// Fix dirty JSON included in response
				if (responseText.indexOf(dirtyPrefix) === 0) {
					responseText = responseText.substring(dirtyPrefix.length, responseText.length);
				}

				// Fix more dirty JSON where array contains "empty" elements... bad Google!
				responseText = responseText.replace(/,(?=,)/g, ',null');

				// Attempt to parse the response
				try {
					response = JSON.parse(responseText);
				} catch (e) {}

				if (response && response[1] && response[1].length && response[1][0] === 'getitemdetailresponse') {
					response = response[1];
					this.img = response[1][0][3];

					if (this.img.indexOf('url(/extensions') !== -1) {
						this.img = this.img.replace(/url\(\/extensions/, 'url(https://chrome.google.com/extensions');
					}

					// Fix applied 16 Oct 2010
					this.img = 'http:' + this.img;

					console.log(this.img);

					this.title = response[1][0][1];
					this.author = response[1][0][2];
					this.author = this.author.trim().replace(/\)$/, '');

					// CHANGED: 16.01.2010
					// Those changes are mae in order to support down/up references.
					var currentTotal = this.users.total;

					if (Ext.localTest) {
						console.log(this.title);
						console.log(this.author);
						console.log(response[1][4]);
						return;
					}

					this.users = this.users || {};
					this.users.total = Number(response[1][4].replace(/,/, ''));

					if (parseInt(currentTotal) === parseInt(this.users.total)) {
						this.users.previous = this.users.previous || null;
					} else {
						this.users.previous = currentTotal;
						// We are going to need this later
						this.metaUpdated = new Date().getTime();
					}

					if (0) {
						console.log('USERS REPORT');
						console.log('TOTAL: ' + this.users.total);
						console.log('PREVIOUS: ' + this.users.previous);
					}

					this.version = response[1][6];

					var currentAverage = this.ratings.average;

					// Update ratings
					this.ratings = this.ratings || {};
					this.ratings.average	= response[1][0][12] || 0,
					this.ratings.total		= Number((response[1][0][22] || 0).toString().replace(/,/, '').toInt());
					this.ratings.stars		= this.ratings.stars || 0;
					this.ratings.previous	= this.ratings.total || null;
					this.ratings['new']		= this.ratings['new'] || false;

					if (currentAverage === this.ratings.average) {
						this.ratings.previousAverage = this.ratings.previousAverage || null;
					} else {
						this.ratings.previousAverage = currentAverage;
					}

					// Extra care :)
					if (this.ratings.total && this.ratings.previous === 0) {
						this.ratings['new'] = true;
					}

					// New rating
					if (this.ratings.total && this.ratings.previous && (this.ratings.total !== this.ratings.previous)) {
						this.ratings['new'] = true;
					}

					// TESTING
					// this.ratings['new'] = true;

					this.handleRatings();

					Ext.store();

					Ext.sendRequest({
						'action': 'update',
						'instance': this
					});

					if (Ext.inOptions) {
						this.update();
					}

					if (Ext.localTest) {
						console.log(this.users);
						console.log('done local test');
						throw (1);
						return this;
					}

					// Nullify stuff
					json = xhr = dirtyPrefix = response = responseText = currentTotal = currentAverage = null;
					// Next step
					this.getComments();
				} else {
					// If we have a title already, its just a network issue
					if (!this.title || !this.version ||  this.title === 'undefined') {
						alert('Extension id seems to be invalid ;(');
						this.remove();	
					} else {
						// Network failure
					}

					Ext.XHR['actualMeta'] = null;
				}
			}.bind(this)
		}).send();
		
		return this;
	},
	
	getComments	: function() {
		Ext.XHR['comments'] = new Ajax({
			'method'		: 'POST',
			'encodeURI'		: false,	// Needed
			'url'			: 'https://chrome.google.com/reviews/components?source=igejgfmbjjjjplnnlgnbejpkpdajkblm',
			'headers'		: {
				'Content-type'	: 'application/xml'
			},
			'parameters'	: {
				'req'		: JSON.stringify({
								"appId": 94,
								"reqId": (+new Date) + "-0.38102638674899936",
								"hl": "en",
								"js": true,
								"specs": [{
									"type": "CommentThread",
									"url": "http://chrome.google.com/extensions/permalink?id=" + this.hash,
									"groups": "chrome_webstore",
									"sortby": "lastModificationDate",
									"startindex": "0",
									"numresults": "1",
									"id": "1"
								}],
								"internedKeys": [],
								"internedValues": []
							 })
			},
			'onSuccess'		: function(xhr) {
				var overrideMethod = 'window.google.annotations2.component.load',
					responseText = xhr.responseText ? xhr.responseText.trim() : '',
					that = this;

				function parseComments(data) {
					var results = data['1'].results;
					that.comments = {
						'total' 			: Number(results.numAnnotations.toString().replace(/,/, '').toInt()),
						'latest'			: results.annotations ? results.annotations[0] : {},
						'previous'			: that.comments.total || null,
						'latestPrevious' 	: $merge(that.comments.latest) || null,
						'new'				: that.comments['new'] || false
					};

					// New comment
					// TODO: Check counter
					if (that.comments.latest && that.comments.latest.timestamp && that.comments.latestPrevious && that.comments.latestPrevious.timestamp && (that.comments.latest.timestamp != that.comments.latestPrevious.timestamp)) {
						that.comments['new'] = true;
					}

					// Extra care :)
					//alert([that.comments.total, that.comments.previous])
					if (that.comments.total && that.comments.previous == 0)  {
						that.comments['new'] = true;
					}

					// TESTING ONLY
					// that.comments['new'] = true;

					that.handleComments();

					xhr = responseText = overrideMethod = data = results = null;

					Ext.store();
					Ext.sendRequest({
						'action'		: 'update',
						'instance'		: that
					});

					// Next step
					//console.log((new Date().getTime() - (Ext.ranksUpdated * 1000)) / 1000);
					if (Ext.shouldGetRatings()) {
						that.getRanking();
					}

					/*
					if (Ext.ranksUpdated) {
						var diff = (new Date().getTime() - (Ext.ranksUpdated * 1000)) / 1000;
						if (diff  > (3600 * 2)) {
							that.getRanking();	
						} else {
							 //console.log('skipping');
						}
					} else {
						that.getRanking();
					}
					*/

					Ext.XHR['comments'] = null;
				}

				// eval is evil! But response can contain JavaScript, not just JSON
				if (responseText && responseText.indexOf(overrideMethod) === 0) {
					responseText = responseText.replace(overrideMethod, 'parseComments');
					eval(responseText);
				}
			}.bind(this)	
		}).send();		
		
		return this;
	},
	
	getRanking		: function() {
		Ext.XHR['ranking'] = new Ajax({
			'method'		: 'get',
			'encodeURI'		: false,	// Needed
			'url'			: 'http://chrome.pathfinder.gr/My/getranking.php?id=' + this.hash + '&source=igejgfmbjjjjplnnlgnbejpkpdajkblm',
			'onSuccess'		: function(xhr) {
				var json = xhr.responseJSON;
				if(json && json.total) {
					
					
					// CHANGED: 16.01.2010
					// Those changes are mae in order to support down/up references.
					var currentPopularity		= this.ranking ? this.ranking.popularity || 999999 : 999999;
					var currentRating			= this.ranking ? this.ranking.rating || 999999 : 999999;
																	
					
					this.ranking			= $merge(json);					
					if(!this.ranking.popularity || this.ranking.popularity > Ext.maxRank) {
						this.ranking.popularity = 999999;
					}
					if(this.ranking.rating > Ext.maxRank) {
						this.ranking.rating 	= 999999;
					}
					
					
					if(parseInt(currentPopularity) == parseInt(this.ranking.popularity)) {
						this.ranking.popularity_previous = this.ranking.popularity_previous || this.ranking.popularity;
					} else {
						this.ranking.popularity_previous = currentPopularity;
					}
					
					if(parseInt(currentRating) == parseInt(this.ranking.rating)) {
						this.ranking.rating_previous = this.ranking.rating_previous || this.ranking.rating;
					} else {
						this.ranking.rating_previous = currentRating;
					}
			
					if(0) {
						console.log('RANKING REPORT');
						console.log('POPULARITY TOTAL: ' + this.ranking.popularity );
						console.log('PREVIOUS: ' + this.ranking.popularity_previous);
						
						console.log('RATING TOTAL: ' + this.ranking.rating );
						console.log('RATING: ' + this.ranking.rating_previous);
					}			
						
										
					
					Ext.totalExtensions		= this.ranking.total;
					
					// Get it for last only
					if(this.ranking.ts < new Date().getTime()){
						Ext.ranksUpdated		= this.ranking.ts;				
					}

					// Mark			
					this.ranksFetched = true;												
						
															
					Ext.store();
					Ext.sendRequest({
						'action'		: 'update',
						'instance'		: this
					});
					
					Ext.XHR['ranking']  = null;
				}
			}.bind(this)	
		}).send();		
		
		return this;	
		
	},
	
	handleComments : function() {
		if(!Ext.options.notify.comments) {
			return this;
		}
		
		
		// for now
		if(this.comments && this.comments['new']) {
			if(this.comments.latest && this.comments.latest.entity.nickname != Ext.options.ignoreFrom ) {			
				this.elements && this.elements.commentsBadge.show();
				Ext.showBadge('comments');
				if($('mark') ){
					$('mark').style.display = 'inline';
			}
		}
		} else {
			this.elements && this.elements.commentsBadge.hide();
		}
		
		
		return this;	
	},
	

	handleRatings : function() {
		// for now
		if(!Ext.options.notify.ratings) {
			return this;
		}

		if(this.ratings && this.ratings['new']) {
			this.elements && this.elements.ratingsBadge.show();			
			Ext.showBadge('ratings');
			if($('mark') ){
				$('mark').style.display = 'inline';
		}

		} else {
			this.elements && this.elements.ratingsBadge.hide();
		}
		

		return this;	
	},
	
	getStarsHTML	: function() {		
		var ret = [''], blocks = 100, row, rate, currentBlocks, currentPct;
		if(!this.ratings.stars) {
			return null;
		}
		
		var html = ['<table cellspacing="1" class="table-stars" caption='+this.ratings.total+'>'];
		html.push('<thead><tr><th colspan="4">' + this.ratings.total + ' rating' + (this.ratings.total > 1 ? 's' : '')+'</th></tr</thead><tbody>');

		
		// We need to sort them now
		
		//console.log(this.ratings.stars);
		this.ratings.stars.sort( function( a, b) {
			return b.rating - a.rating;
		});
		

		var cnt = 0;
		for(var i = 4; i > -1; i--) {
			rate	= this.ratings.stars[cnt];
			if(!rate || rate.rating != i+ 1 )  {
				rate = {
					'count'  : 0,
					'rating' : i +1
				} 
			} else {
				cnt++
			}
			
			html.push('<tr>');
			
			currentPct 	= Math.round( ( 100 * rate.count) / this.ratings.total )
			//currentPct		= 
			row 			= '';
			
			html.push('<th>' + ( rate.rating  ) + ' star' + (rate.rating > 1 ? 's' : '') +': '  + '</th>');
		
			html.push('<td class="table-stars-bar"><div style="width: '+currentPct + '%;"></div></td>');
			html.push('<td>' + rate.count +'</td>');
			html.push('<td>' + currentPct + '%' +'</td>');
			
			//html.push(row+'\n');
			html.push('</tr>');			
			
		}

		html.push('</tbody></table>')		
		return html.join('');
		
	},
	
	getCommentsHTML : function() {
		if(this.comments && this.comments.latest && this.comments.latest.entity) {
			var html = ['<div style="max-height: '+ (document.body.offsetHeight -10) + 'px;overflow: auto;"><strong>Latest review from: ' + (this.comments.latest.entity.nickname || 'Anonymous')+'</strong>'];
			html.push('<p>'+(this.comments.latest && this.comments.latest.comment ? this.comments.latest.comment.replace(/\n/gi, '<br />')  : 'N/A') + '</p></div>');
		
			return html.join('');
		} else {
			return null;
		}
	},
	
	getGraph : function(type, source) {
		var self 		= this;
		var interval	= 3600 *1000* 5; // 5 hours
		this.graphData	= this.graphData || {
			'fetched'		: null,
			'popularity' 	: [],
			'rating'		: [],
			'ticks'			: []
		}
		
		// Already done
		if(source.graph) {
			return source.graphElement;
		}
	
		// We need an absolute temp dom
		if(!window.absoluteElement) {
			window.absoluteElement = $C('div');
			window.absoluteElement.style.cssText = 'position: absolute; top: 0; left: 0; opacity: 1;'
			window.absoluteElement.injectIn(document.body);
		}
	
		// Create an absolute element to make the graph in
		if(!source.graphElement) {
			source.graphElement 					= $C('div');
			source.graphElement.innerHTML 			= 'loading ...';
		
			source.graphElement.injectIn(window.absoluteElement);
		}	
	
		
		// Already		
		if(this.graphData.fetched && (new Date().getTime() - this.graphData.fetched ) < interval) {
		//if(0){
			if( this.graphData[type] ) {
				source.graphElement.style.cssText  				= 'margin-bottom: 20px; margin-left: 25px; width: 170px; height: 35px;border-bottom: 1px solid #ffcc66;';
				
				source.graph = new Graph([ this.graphData[type] ], source.graphElement);
				source.graph.setOptions({
					'reverse' : true,
					'ticks' : this.graphData['ticks']
				}).setSeries([ this.graphData[type] ] );
				
			} else {
					source.graphElement.innerHTML = '<p style="text-align: center;">Not enough data to plot graph</p>';
			}
		} else {		
			new Ajax({
				'url'		: 'http://chrome.pathfinder.gr/My/getdata.php?id=' + this.hash + '&source=igejgfmbjjjjplnnlgnbejpkpdajkblm',
				'method'  	: 'get',
				'onSuccess' : function(xhr) {
					self.graphData = {
						'fetched' : new Date().getTime()
					};
					
					var json 		= xhr.responseJSON;
					
					if(!json || json.length == 0) {
						Ext.store();
						source.graphElement.innerHTML = '<p style="text-align: center;">Not enough data to plot graph</p>';
						return ;
					}
					
					source.graphElement.style.cssText  = 'margin-bottom: 20px; margin-left: 25px; width: 170px; height: 35px;border-bottom: 1px solid #ffcc66;'
					var popularity 	= {
						'data': [],
						'fill': true,
						'stroke' : true,
						'ctx' : {
							'lineWidth' 		: 1,
							'strokeStyle' 		: '#fff',
							'fillStyle'			: '#ffcc66'
						}
					};
					
					
					var rating 	= {
						'data': [],
						'fill': true,
						'stroke' : true,
						'ctx' : {
							'lineWidth' 		: 1,
							'strokeStyle' 		: '#fff',
							'fillStyle'			: '#ffcc66'
						}
					};
					
					
					var users 	= {
						'data': [],
						'fill': true,
						'stroke' : true,
						'ctx' : {
							'lineWidth' 		: 1,
							'strokeStyle' 		: '#fff',
							'fillStyle'			: '#ffcc66'
						}
					};
					
					
					var ticks		= {};
					var cnt 		= 0;
					json.each(function(item, index) {
						var date = new Date(item.ts * 1000);
						
						ticks[type] = ticks[type] || {};
						
						popularity.data.push(item.popularity);
						rating.data.push(item.rating);
						
						if(parseInt(item.users)){
							ticks[type][cnt++] =date.toGMTString().replace(/^.*? |20.*?$/gi, '');
							users.data.push(item.users);
						} else {
							
							ticks[type][cnt++] = date.toGMTString().replace(/^.*? |20.*?$/gi, '');
						}
						
					});
					
					self.graphData['popularity'] 	= popularity;
					self.graphData['rating'] 		= rating;
					self.graphData['ticks']			= ticks;
					
					if(type === 'users' && users.data.length === 0) {
						source.graphElement.innerHTML = '<p style="text-align: center;">Not enough data to plot graph</p>';
						
						return;
					}

					
					var scope = eval(type);
					
					source.graph = new Graph([], source.graphElement);		
					
					source.graph.setOptions({
						'ticks' 	: ticks[type],
						'reverse' 	: type != 'users' ? true : false
					}).setSeries(  [ scope] );
				}
				}).send();
		}
		
		
		
		// Let's construct this
		

		
		
		

		// We might need this
		//source.graph = new Graph(null, source.graphElement);

		// That is what we need :)
		return source.graphElement;		
		
	}
});

Ext.Bg = {
	update : function() {
		chrome.extension.sendRequest( { 'bg.update' : true}, function(response) {
			// response handler
		});	
	},
	
	reload	: function() {
		chrome.extension.sendRequest( { 'bg.reload' : true}, function(response) {
			// response handler
		});	
		
	},
	
	interval : function() {
		chrome.extension.sendRequest( { 'bg.interval' : true}, function(response) {
			// response handler
		});	
	}
}

Ext.Notification = new Class({
	options		: {
		'icon'	: 'icons/48.png',
		'title'	: 'My Extensions - New Review!',
		'ttl'	: null
	},
	
	initialize	: function(text, title, icon, options) {
		this.setOptions(options);
		
		if(!( webkitNotifications && webkitNotifications.createNotification)) {
			return this;
		}
		this.notification = webkitNotifications.createNotification(icon || this.options.icon, title || this.options.title, text);
		
		if(this.options.ttl) {
			this.close.delay(this.options.ttl);
		}
		
		return this.show();
	},
	
	close		: function() {
		this.notification.close();
	},
	
	show		: function() {
		this.notification.show();
	}
}).implement(new Events, new Options);




Ajax.setOptions({
	//'timeout'		: 15000,
	'onTimeout'		: function() {
		//
		// window.alert('There seems to be an network issue, please try again later');
		//console.log('Timing out');
	}
});


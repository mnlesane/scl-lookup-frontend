/*
TODO Gameplan:
- V0: Unorganized listing
- V1: Unorganized listing, sorted by signal aggregation formula
- V2: Unorganized listing, sorted by signal aggregation formula, with category filter
*/
var queryString = ''
var timeout;

function ymdhis(timestamp) {
	d = new Date(timestamp * 1000);
	return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
}

function truncate(string, len) {
	if(string) {
		return string.length > len ?
			string.substring(0, len - 3) + '...'
			: string;
	} else {
		return "";
	}
}

function research(str,keyup = true) {
	$('#searchbar').val(str);
	if(keyup) {
		$('#searchbar').trigger('keyup');
	}
}

function query(searchQuery,nextFunc) {
	var out;
	$.ajax({
	    url: "https://api.thegraph.com/subgraphs/name/mnlesane/subgraph-contract-lookup",
	    type: "POST",
	    dataType: "json",
	    data: JSON.stringify({query:searchQuery, variables:null}),
	    contentType: "application/json"
	}).done(function(e) {
		nextFunc(e);
	});
}

function setUrl(x) {
	history.replaceState(null, '', x);
}
function swap(a,b) {
	var placeholder = $(a).parent().prop('outerHTML');
	$(a).parent().html($(b)).parent().prop('outerHTML');
	$(b).parent().html(placeholder);
}
function crudeSort(a, b) {   
      var types = {
        'subgraph': 4,
        'subgraphDeployment': 3,
        'contract': 2,
        'contractEvent': 1
      };
      	return $(b).data('signal') - $(a).data('signal');
}

function search() {
	var queryString = $('#searchbar').val();
	setUrl('#/search/'+queryString);
	var list = [{}];
	console.log('Search for "'+queryString+"'");
	queryString = queryString.replace(/"/g,"'");
	
//	if(queryString.split(' ').length) {
//	}
	
	incSubgraph = $('#search-subgraph').is(':checked');
	incSubgraphDeployment = $('#search-subgraphDeployment').is(':checked');
	incContract = $('#search-contract').is(':checked');
	incContractEvent = $('#search-contractEvent').is(':checked');
	
	var searchQuery = `{
	`
	+(incContractEvent ? `
  contractEventSearch(text:"`+queryString+`",first:1000) {
    id
    event
    contract {
      id
    }
  }
  `:``)
  +(incContract ? `
  contractSearch(text:"`+queryString+`",first:1000) {
    id
  }
  `:``)
  +(incSubgraph ? `
  subgraphSearch(text:"`+queryString+`",first:1000) {
    id
    displayName
    description
    image
    codeRepository
    website
    currentSignalledTokens
    entityVersion
    active
  }
  `:``)
  +(incSubgraphDeployment  ? `
  subgraphDeploymentSearch(text:"`+queryString+`",first:1000) {
    id
    originalName
    versions {
      label
      entityVersion
        subgraph {
          id
          displayName
          description
          image
          codeRepository
          website
          currentSignalledTokens
          entityVersion
          active
        }
    }
  }
  `:``)+`
	    }`;
	    
	query(searchQuery,function(e) {
		$('#searchResults').html('');
			  
		if(!e.hasOwnProperty('data')) {
			renderNoResults(e.errors[0].message);
			return;
		} else {
			data = e.data;
		}
		  
		if(data.hasOwnProperty('subgraphSearch')) {
			$.each(data.subgraphSearch,function(k,v) {
				if(v.entityVersion != 2) {
					return;
				}
				renderSubgraph(v);
			});
		}
		  
		if(data.hasOwnProperty('contractEventSearch')) {
			$.each(data.contractEventSearch,function(k,v) {
				renderContractEvent(v);
			});
		}
		  
		if(data.hasOwnProperty('contractSearch')) {
			$.each(data.contractSearch,function(k,v) {
				renderContract(v);
			});
		}
		  
		if(data.hasOwnProperty('subgraphDeploymentSearch')) {
			$.each(data.subgraphDeploymentSearch,function(k,v) {
				$.each(v.versions,function(k,sv) {
					if(sv.entityVersion != 2) {
						return;
					}
					renderSubgraphDeployment(sv,v);
				});
			});
		}
		 
		if($('#searchResults li').size() == 0) {
			renderNoResults();
		} else {
			$('#searchResults a').sort(crudeSort).appendTo($('#searchResults'));
		}
		$('#searchResults').show();
		$('.quickSearch').show();
	});
}
function renderNoResults(message = "") {
	template = `
    <a href='#/'><li class='vertical-align-top'>
      <div class='display-inline-block vertical-align-top f-100 m-1 w-80'>
        <div class='f-100 color-gray mb-0'>No search results found.</div>
      </div>
      {{MESSAGE}}
    </li></a>
	`;
	var messageReplace = message.length ? '<div class="error f-70 text-darkred pl-05 pb-1"><b>Details:</b> '+message+'</div>' : "";
	append = template.replace('{{MESSAGE}}',messageReplace);
	$('#searchResults').append(append);
	$('#searchResults').show();
	$('.quickSearch').show();
}

function renderContractEvent(v) {
	template = "\
    <a href='#/' data-id='{{ID}}' data-type='contract' data-signal=0><li class='vertical-align-top'>\
      <div class='display-inline-block w-10 f-200 text-center mt-025'>\
        <img src='img/event.png' class='w-75'>\
      </div>\
      <div class='display-inline-block vertical-align-top f-100 mt-05 w-80'>\
        <div class='f-75 color-gray mb-0'>Contract Event Match</div>\
        <div class='mb-025 f-75 word-break-break-word'><b>{{EVENT}}</b></div>\
        <div class='f-75 mb-1'>Contract: {{CONTRACT}}</div>\
      </div>\
    </li></a>\
	";
	if(v.description === null) v.description = "";
	append = template.replace('{{ID}}',v.contract.id).replace('{{EVENT}}',v.event).replace('{{CONTRACT}}',v.contract.id);
	$('#searchResults').append(append);
}

function renderContract(v) {
	template = "\
    <a href='#/' data-id='{{ID}}' data-type='contract' data-signal=0><li class='vertical-align-top'>\
      <div class='display-inline-block w-10 f-200 text-center mt-025 mb-025'>\
        <img src='img/contract.png' class='w-75'>\
      </div>\
      <div class='display-inline-block vertical-align-top f-100 mt-05 w-80'>\
        <div class='f-75 color-gray mb-0'>Contract Match</div>\
        <div class='mb-025 f-75'><b>{{CONTRACT}}</b></div>\
        <div class='f-75 mb-1'></div>\
      </div>\
    </li></a>\
	";
	if(v.description === null) v.description = "";
	append = template.replace('{{ID}}',v.id).replace('{{CONTRACT}}',v.id);
	$('#searchResults').append(append);
}

function renderSubgraph(v) {
	template = "\
    <a href='#/' data-id='{{ID}}' data-type='subgraph' data-signal='{{SIGNAL}}'><li class='vertical-align-top'>\
      <div class='display-inline-block w-10'>\
        <img src='{{IMG}}' class='w-75 m-05'>\
      </div>\
      <div class='display-inline-block vertical-align-top f-100 mt-025 w-80'>\
        <div class='f-75 color-gray mb-0'>Subgraph Match {{STATUS}}</div>\
        <div class='mb-025'><b>{{NAME}}</b></div>\
        <div class='f-75 mb-1'>{{DESC}}</div>\
      </div>\
    </li></a>\
	";
	if(v.description === null) v.description = "";
	append = template
		.replace('{{ID}}',v.id)
		.replace('{{IMG}}',v.image)
		.replace('{{NAME}}',v.displayName)
		.replace('{{DESC}}',truncate(v.description,128))
		.replaceAll('{{SIGNAL}}',(v.currentSignalledTokens !== null ? v.currentSignalledTokens : 0)/Math.pow(10,18))
		.replace('{{STATUS}}',v.active ? '' : '<b>(Deprecated)</b>')
		;
	$('#searchResults').append(append);
}

function renderSubgraphDeployment(v,deployment) {
	// data-debug='"+JSON.stringify(v)+"'
	
	template = "\
    <a href='#/' data-id='{{ID}}' data-subgraph='{{SUBGRAPHID}}' data-signal='{{SIGNAL}}' data-type='subgraphDeployment'><li class='vertical-align-top'>\
      <div class='display-inline-block w-10'>\
        <img src='{{IMG}}' class='w-75 m-05'>\
      </div>\
      <div class='display-inline-block vertical-align-top f-100 mt-025 w-80'>\
        <div class='f-75 color-gray mb-0'>Subgraph Version Match {{STATUS}}</div>\
        <div><b>{{NAME}}</b></div><div class='mb-025 font-weight-bold f-75'>{{VERSION}}</div>\
        <div class='f-75 mb-1'>{{DESC}}</div>\
      </div>\
    </li></a>\
	";
	if(v.description === null) v.description = "";
	append = template
		.replace('{{ID}}',deployment.id)
		.replace('{{IMG}}',v.subgraph.image)
		.replace('{{NAME}}',deployment.originalName ? deployment.originalName : v.subgraph.displayName)
		.replace('{{DESC}}',truncate(v.subgraph.description,128))
		.replace('{{SUBGRAPHID}}',v.subgraph.id)
		.replace('{{VERSION}}',v.label)
		.replaceAll('{{SIGNAL}}',(v.subgraph.currentSignalledTokens !== null ? v.subgraph.currentSignalledTokens : 0)/Math.pow(10,18))
		.replace('{{STATUS}}',v.subgraph.active ? '' : '<b>(Deprecated)</b>')
		;
	$('#searchResults').append(append);
}

function detailContract(id) {
	setUrl('#/detail/contract/'+id);
	var searchQuery = `
{
  contracts(first:1000,where:{id:"`+id+`"})
  {
    id
    contractEvent { event }
    subgraphDeployment {
       ipfsHash
      versions {
        id
        version
        entityVersion
        label
         subgraph {
          id
          active
          image
          displayName
          signalledTokens
          currentSignalledTokens
        }
      }
    }
  }
}
	`;
	query(searchQuery,function(e) {
		var c = e.data.contracts[0];

		var template = `
		<div class='w-100'>
		  <div class='mb-1'>
		    <span class='f-125 font-weight-bold'><a href='https://etherscan.io/address/{{CADDR}}' target='_blank'>{{CADDR}}</a></span><br/>
		    <span class='f-100 color-darkgray'>Contract</span>
		  </div>
		  <div class='f-100 font-weight-bold'>
		    Events:
		  </div>
		  <div>
		    <ul class='pl-15 mt-0 mb-05'>
		      {{EVENTS}}
		    </ul>
		  </div>
		  <div class='f-100 font-weight-bold'>
		    Subgraphs:
		  </div>
		  <div class='contract-subgraph-versions'>
		    {{VERSIONS}}
		  </div>
		</div>
		`;

		eventReplace = "";
		$.each(c.contractEvent,function(k,e) {
			eventTemplate = `
	<li>
	{{EVENT}}
	</li>
			`;
			eventReplace = eventReplace + eventTemplate.replace('{{EVENT}}',e.event);
		});
			
		var versions = {};
		$.each(c.subgraphDeployment,function(k,d) {
			$.each(d.versions,function(k,sv) {
				if(sv.entityVersion != 2) return;
				versions[sv.id] = sv;
			});		
		});
		versionReplace = "";
		$.each(versions,function(k,sv) {
			cdTemplate = `
	<div class='w-100 display-inline-block border-darkgray p-05 m-05 contract-subgraph-version' data-signal='{{SIGNAL}}'>
	  <div class='w-10 display-inline-block'>
	    <img src='{{IMAGE}}' class='w-75'>
	  </div>
	  <div class='display-inline-block vertical-align-top w-80'>
	    <div class='f-125 font-weight-bold'>
	      <a href='https://thegraph.com/explorer/subgraph?id={{SUBGRAPHID}}&v={{VNUM}}' target='_blank'>{{NAME}}</a>
	      {{STATUS}}
	    <a href='#/' onclick='research("\\"{{NAME}}\\""); return false;'>
	      <img src='img/search.png' class='icon ml-05' title='Search'>
	    </a>
	    <a href='#/' onclick='detailSubgraph("{{SUBGRAPHID}}"); return false;'>
	      <img src='img/view.png' class='icon ml-05' title='View Details'>
	    </a>
	    </div>
	    <div class='f-100 color-darkgray font-weight-bold'>
	      {{VERSION}}
	    </div>
	  </div>
	</div>
			`;
			versionReplace = versionReplace + cdTemplate
				.replace('{{IMAGE}}',sv.subgraph.image)
				.replaceAll('{{NAME}}',sv.subgraph.displayName)
				.replace('{{VERSION}}',sv.label)
				.replaceAll('{{SUBGRAPHID}}',sv.subgraph.id)
				.replace('{{VNUM}}',sv.version)
				.replace('{{SIGNAL}}',(sv.subgraph.currentSignalledTokens !== null ? sv.subgraph.currentSignalledTokens : 0)/Math.pow(10,18))
				.replace('{{STATUS}}',sv.subgraph.active ? '' : '<span class="color-gray f-75">(Deprecated)</span>')
				;
			
			var append = template
				.replaceAll('{{CADDR}}',id)
				.replaceAll('{{EVENTS}}',eventReplace)
				.replaceAll('{{VERSIONS}}',versionReplace)
				;
			$('#searchDetail').html(append);
		});
		$('#searchDetail .contract-subgraph-versions .contract-subgraph-version').sort(crudeSort).appendTo('.contract-subgraph-versions');
	});
}

function detailSubgraphDeployment(id,subgraph) {
	detailSubgraph(subgraph,id);
}

function detailSubgraph(id,deploymentID = "") {
	if(deploymentID === "") {
		setUrl('#/detail/subgraph/'+id);
	} else {
		setUrl('#/detail/subgraph/'+id+'/'+deploymentID);
	}
	
	var searchQuery = `
{
  subgraphs(where:{id:"`+id+`",entityVersion:2}) {
    id
    owner { id }
    displayName
    description
    image
    codeRepository
    website
    createdAt
    updatedAt
    active
    versions {
      id
      version
      createdAt
      metadataHash
      description
      label
      entityVersion
      subgraphDeployment {
        id
        ipfsHash
        network {
          id
        }
        contract {
          id
          contractEvent {
            event
          }
        }
      }
    }
  }
}
	`;
	query(searchQuery,function(e) {
		var v = e.data.subgraphs[0];
		template = `
	<div class='w-100'>
	  <div class='w-100 display-inline'>
	    <div class='display-inline-block w-20'>
	      <a href="https://thegraph.com/explorer/subgraph?id={{ID}}" target='_blank'>
		<img src="{{IMAGE}}" class='w-100'>
	      </a>
	    </div>
	    <div class='vertical-align-top display-inline-block mt-1 ml-05'>
	      <div class='f-150 font-weight-bold'><a href='https://thegraph.com/explorer/subgraph?id={{ID}}' target='_blank'>{{NAME}}</a></div>
	      <div class='color-darkgray f-100 mb-05'>
		Subgraph owned by <a href='https://thegraph.com/explorer/profile?id={{ADDRESS}}' target='_blank' class='font-weight-bold'>{{ADDRESS}}</a>
	      </div>
	      <div class='font-weight-bold mb-1'>
		<a href='{{WEBSITE}}' target='_blank'>Website</a> | <a href='{{REPO}}' target='_blank'>Repository</a>
	      </div>
	    </div>
	  </div>
	  <div class='w-100 display-inline-block mb-1'>
	    <div class='display-inline-block w-100'>
	      <div class='f-100 mb-1 bg-lightgray p-1'>
		{{DESC}}
	      </div>
	      <div class='display-inline-block color-darkgray w-50'>Created: {{CDATE}}</div>
	      <div class='display-inline-block color-darkgray'>Updated: {{UDATE}}</div>
	      <div class='display-inline-block color-darkgray w-50'>Status: <span class="color-darkgray"><b>{{STATUS}}</b></span></div>
	    </div>
	  </div>
	  <div class='w-100 display-inline-block'>
	    <div class='display-block'>
	      <div class='f-125 font-weight-bold mb-05'>
	      {{VERSION_LABEL}}
	      </div>
	      <div id='version-details'>
	      {{VERSIONS}}
	      </div>
	    </div>
	  </div>
	</div>
		`;
		var append = template
			.replace('{{IMAGE}}',v.image)
			.replace('{{NAME}}',v.displayName)
			.replace('{{DESC}}',v.description)
			.replaceAll('{{ADDRESS}}',v.owner.id)
			.replace('{{CDATE}}',ymdhis(v.createdAt))
			.replace('{{UDATE}}',ymdhis(v.updatedAt))
			.replace('{{REPO}}',v.codeRepository)
			.replace('{{WEBSITE}}',v.website)
			.replaceAll('{{ID}}',v.id)
			.replace('{{VERSION_LABEL}}',deploymentID ? "Subgraph Deployment Detail" : "Versions")
			.replace('{{STATUS}}',v.active ? 'Active' : 'Deprecated')
			;
		var versionReplace = "";
		$.each(v.versions,function(k,sv) {
			if(sv.entityVersion != 2) return;
			if(deploymentID && sv.subgraphDeployment.id != deploymentID) return;
			versionTemplate = `
	<div class='versionBox bg-lightgray p-05 mb-05'>
	  <div class='f-100'>
	    <span class='font-weight-bold'><a href='https://thegraph.com/explorer/subgraph?id={{SUBGRAPHID}}&v={{VERSIONID}}' target='_blank'>{{LABEL}}</a></span>
	    (<a href='https://ipfs.network.thegraph.com/api/v0/cat?arg={{IPFSHASH}}' target='_blank'>Manifest</a>)
	  </div>
	  <div class='f-100 color-darkgray mb-05'>
	    Network: {{NETWORK}}
	  </div>
	  <div>
	  {{CONTRACTS}}
	  </div>
	</div>
			`;
			
			contractReplace = "";
			
			$.each(sv.subgraphDeployment.contract,function(k,c) {
				contractTemplate = `
	<div class='contractBox border-darkgray p-05 mb-05'>
	  <div class='f-100 font-weight-bold mb-025'>
	    Contract: <a href='https://etherscan.io/address/{{CADDR}}' target='_blank'>{{CADDR}}</a>
	    <div class='d-inline-block'>
	      <a href='#/' onclick='navigator.clipboard.writeText("{{CADDR}}").then(() => {}); return false;'>
	        <img src='img/copy.png' class='icon ml-05' title='Copy'>
	      </a>
	      <a href='#/' onclick='research("{{CADDR}}"); return false;'>
	        <img src='img/search.png' class='icon ml-05' title='Search'>
	      </a>
	      <a href='#/' onclick='detailContract("{{CADDR}}"); return false;'>
	        <img src='img/view.png' class='icon ml-05' title='View Details'>
	      </a>
	    </div>
	  </div>
	  <div>
	    <b>Events:</b>
	    <ul class='pl-15 mt-0 mb-05'>
	    {{EVENTS}}
	    </ul>
	  </div>
	</div>
				`;
				eventReplace = "";
				$.each(c.contractEvent,function(k,e) {
					eventTemplate = `
	<li>
	  {{EVENT}}
	</li>
					`;
					eventReplace = eventReplace + eventTemplate.replace('{{EVENT}}',e.event);
				});
				contractReplace = contractReplace + contractTemplate
					.replaceAll('{{CADDR}}',c.id)
					.replaceAll('{{EVENTS}}',eventReplace)
					;
			});
			
			versionReplace = versionReplace + versionTemplate
				.replace('{{LABEL}}',sv.label)
				.replaceAll('{{IPFSHASH}}',sv.subgraphDeployment.ipfsHash)
				.replace('{{NETWORK}}',sv.subgraphDeployment.network.id)
				.replace('{{CONTRACTS}}',contractReplace)
				.replace('{{SUBGRAPHID}}',v.id)
				.replace('{{VERSIONID}}',sv.version)
				;
		});
		append = append.replace('{{VERSIONS}}',versionReplace);
		$('#searchDetail').html(append);
	});
}

function processHash() {
	var hash = window.location.hash;
	var uri = decodeURIComponent(hash);
	var params = uri.replace('#','').split('/');
	params.shift();
	switch(params[0]) { // Search or Detail
		case 'search':
			research(params[1],false);
			search();
			break;
		case 'detail':
			if(params[1] == 'contract') detailContract(params[2]);
			if(params[1] == 'subgraph') detailSubgraph(params[2],params[3]);
			break;
	}
}

$(document).ready(function() {
	processHash();

	$('.quickSearch').hide();
	$('#searchResults').on("click","li",function(e) {
	  e.preventDefault();
	  var id = $(this).parent().data('id');
	  var type = $(this).parent().data('type');
	  if(id) {
	  	switch(type) {
	  		case 'subgraph':
	  			detailSubgraph(id);
	  			break;
	  		case 'subgraphDeployment':
	  			detailSubgraphDeployment(id,$(this).parent().data('subgraph'));
	  			break;
	  		case 'contract':
	  			detailContract(id);
	  			break;
	  		case 'contractEvent':
	  			//detailContractEvent(id);
	  			break;
	  	}
	  }
	});

	var query = ''
	$('#searchbar').keyup(function() {
		clearTimeout(timeout);
		queryString = $(this).val();
		if(!queryString.length) {
		  $('.quickSearch').hide();
		  $('#searchResults').hide();
		  return;
		}
		timeout = setTimeout(search,500)
	});
	$('input[type="checkbox"]').change(function() {
		research($('#searchbar').val());
	});
});

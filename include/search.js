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

function research(str) {
	$('#searchbar').val(str);
	$('#searchbar').trigger('keyup');
}

function search() {
	var list = [{}];
	console.log('Search for "'+queryString+"'");
	queryString = queryString.replace(/"/g,"'");
	
	incSubgraph = $('#search-subgraph').is(':checked');
	incSubgraphDeployment = $('#search-subgraphDeployment').is(':checked');
	incContract = $('#search-contract').is(':checked');
	incContractEvent = $('#search-contractEvent').is(':checked');
	
	var searchQuery = `{
	`
	+(incContractEvent ? `
  contractEventSearch(text:"`+queryString+`") {
    id
    event
    contract {
      id
    }
  }
  `:``)
  +(incContract ? `
  contractSearch(text:"`+queryString+`") {
    id
  }
  `:``)
  +(incSubgraph ? `
  subgraphSearch(text:"`+queryString+`") {
    id
    displayName
    description
    image
    codeRepository
    website
  }
  `:``)
  +(incSubgraphDeployment  ? `
  subgraphDeploymentSearch(text:"`+queryString+`") {
    id
    originalName
    subgraph {
      id
      displayName
      description
      image
      codeRepository
      website
    }
  }
  `:``)+`
	    }`;
	    
	var res = 
	$.ajax({
	    url: "https://api.thegraph.com/subgraphs/name/mnlesane/subgraph-contract-lookup",
	    type: "POST",
	    dataType: "json",
	    data: JSON.stringify({query:searchQuery, variables:null}),
	    contentType: "application/json"
	}).done(function(e) {
	  $('#searchResults').html('');
	  $('#searchResults').show();
	  $('.quickSearch').show();
	  
	  if(!e.hasOwnProperty('data')) {
	    console.log(e);
	    renderNoResults();
	    return;
	  } else {
	    data = e.data;
	  }
	  
	  if(data.hasOwnProperty('subgraphSearch')) {
	    $.each(data.subgraphSearch,function(k,v) {
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
	      renderSubgraphDeployment(v);
	    });
	  }
	  
	  if($('#searchResults li').size() == 0) {
	    renderNoResults();
	  }
	});
}
function renderNoResults() {
	template = "\
    <a href='#/'><li class='vertical-align-top'>\
      <div class='display-inline-block vertical-align-top f-100 m-1 w-80'>\
        <div class='f-100 color-gray mb-0'>No search results found.</div>\
      </div>\
    </li></a>\
	";
	append = template;
	$('#searchResults').append(append);
}

function renderContractEvent(v) {
	template = "\
    <a href='#/' data-id='{{ID}}' data-type='contract'><li class='vertical-align-top'>\
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
    <a href='#/' data-id='{{ID}}' data-type='contract'><li class='vertical-align-top'>\
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
    <a href='#/' data-id='{{ID}}' data-type='subgraph'><li class='vertical-align-top'>\
      <div class='display-inline-block w-10'>\
        <img src='{{IMG}}' class='w-75 m-05'>\
      </div>\
      <div class='display-inline-block vertical-align-top f-100 mt-025 w-80'>\
        <div class='f-75 color-gray mb-0'>Subgraph Match</div>\
        <div class='mb-025'><b>{{NAME}}</b></div>\
        <div class='f-75 mb-1'>{{DESC}}</div>\
      </div>\
    </li></a>\
	";
	if(v.description === null) v.description = "";
	append = template.replace('{{ID}}',v.id).replace('{{IMG}}',v.image).replace('{{NAME}}',v.displayName).replace('{{DESC}}',truncate(v.description,128));
	$('#searchResults').append(append);
}

function renderSubgraphDeployment(v) {
	template = "\
    <a href='#/' data-id='{{ID}}' data-subgraph='{{SUBGRAPHID}}' data-type='subgraphDeployment' data-debug='"+JSON.stringify(v)+"'><li class='vertical-align-top'>\
      <div class='display-inline-block w-10'>\
        <img src='{{IMG}}' class='w-75 m-05'>\
      </div>\
      <div class='display-inline-block vertical-align-top f-100 mt-025 w-80'>\
        <div class='f-75 color-gray mb-0'>Subgraph Deployment Match</div>\
        <div class='mb-025'><b>{{NAME}}</b></div>\
        <div class='f-75 mb-1'>{{DESC}}</div>\
      </div>\
    </li></a>\
	";
	if(v.description === null) v.description = "";
	append = template
		.replace('{{ID}}',v.id)
		.replace('{{IMG}}',v.subgraph.image)
		.replace('{{NAME}}',v.originalName ? v.originalName : v.subgraph.displayName)
		.replace('{{DESC}}',truncate(v.subgraph.description,128))
		.replace('{{SUBGRAPHID}}',v.subgraph.id)
		;
	$('#searchResults').append(append);
}

function detailContract(id) {
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
        label
         subgraph {
          id
          image
          displayName
        }
      }
    }
  }
}
	`;
	$.ajax({
	    url: "https://api.thegraph.com/subgraphs/name/mnlesane/subgraph-contract-lookup",
	    type: "POST",
	    dataType: "json",
	    data: JSON.stringify({query:searchQuery, variables:null}),
	    contentType: "application/json"
	}).done(function(e) {
		var c = e.data.contracts[0];
		console.log(e);
		
		var template = `
		<div class='w-100'>
		  <div class='mb-1'>
		    <span class='f-125 font-weight-bold'>{{CADDR}}</span><br/>
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
		  <div>
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
				versions[sv.id] = sv;
			});		
		});
		console.log(versions);
		versionReplace = "";
		console.log(versions);
		$.each(versions,function(k,sv) {
			cdTemplate = `
<div class='w-100 display-inline-block border-darkgray p-05 m-05'>
  <div class='w-10 display-inline-block'>
    <img src='{{IMAGE}}' class='w-75'>
  </div>
  <div class='display-inline-block vertical-align-top'>
    <div class='f-125 font-weight-bold'>
      <a href='https://thegraph.com/explorer/subgraph?id={{SUBGRAPHID}}&v={{VNUM}}' target='_blank'>{{NAME}}</a>
    <a href='#/' onclick='research("\\"{{NAME}}\\"");'>
      <img src='img/search.png' class='w-3 ml-05'>
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
				.replace('{{SUBGRAPHID}}',sv.subgraph.id)
				.replace('{{VNUM}}',sv.version)
				;
		});
		
		var append = template
			.replaceAll('{{CADDR}}',id)
			.replaceAll('{{EVENTS}}',eventReplace)
			.replaceAll('{{VERSIONS}}',versionReplace)
			;
		$('#searchDetail').html(append);	
	});
}

function detailSubgraphDeployment(id,subgraph) {
	detailSubgraph(subgraph,id);
}

function detailSubgraph(id,deploymentID = "") {
	var searchQuery = '\
{\
  subgraphs(where:{id:"'+id+'"}) {\
    id\
    owner { id }\
    displayName\
    description\
    image\
    codeRepository\
    website\
    createdAt\
    updatedAt\
    versions {\
      id\
      version\
      createdAt\
      metadataHash\
      description\
      label\
      subgraphDeployment {\
        id\
        ipfsHash\
        network {\
          id\
        }\
        contract {\
          id\
          contractEvent {\
            event\
          }\
        }\
      }\
    }\
  }\
}\
	';
//	var res = 
	$.ajax({
	    url: "https://api.thegraph.com/subgraphs/name/mnlesane/subgraph-contract-lookup",
	    type: "POST",
	    dataType: "json",
	    data: JSON.stringify({query:searchQuery, variables:null}),
	    contentType: "application/json"
	}).done(function(e) {
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
      <div class='f-150 font-weight-bold'>{{NAME}}</div>
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
			.replace('{{ID}}',v.id)
			.replace('{{VERSION_LABEL}}',deploymentID ? "Subgraph Deployment Detail" : "Versions")
			;
		var versionReplace = "";
		$.each(v.versions,function(k,sv) {
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
    <a href='#/' onclick='navigator.clipboard.writeText("{{CADDR}}").then(() => {});'>
      <img src='img/copy.png' class='w-3 ml-05'>
    </a>
    <a href='#/' onclick='research("{{CADDR}}");'>
      <img src='img/search.png' class='w-3 ml-05'>
    </a>
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
				;
		});
		append = append.replace('{{VERSIONS}}',versionReplace);
		$('#searchDetail').html(append);
	});
}

$(document).ready(function() {
	$('#searchResults').on("click","li",function(e) {
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

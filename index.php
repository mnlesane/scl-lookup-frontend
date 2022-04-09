<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="include/style.css">
    <script type='text/javascript' src='include/jquery-1.10.2.js'></script>
    <script type='text/javascript' src='include/search.js'></script>
  </head>
  <body>
    <div class='table w-100' style='height:100%'>
      <div class='row'>
        <div class='col w-15'>
          <a href='./'>
            <img src='img/scl.png'>
          </a>
        </div>
        <div class='col'>
          <div class='m-1'>
            <div class='f-70 bg-lightgray p-1 mb-2 info'>
            Subgraph Contract Lookup allows for more detailed searching of subgraphs on <a href='http://thegraph.com/explorer'>The Graph's mainnet</a>, including contract addresses and events.  Its subgraph can currently be accessed <a href='https://thegraph.com/hosted-service/subgraph/mnlesane/subgraph-contract-lookup'>here</a>.
            </div>
            <div id='search-filter' class='font-weight-bold m-0 mb-05 w-40 p-025'>
              <span class='f-75'>Search:</span>
              <input type="checkbox" name="filter[subgraph]" checked><div>Subgraphs</div>
              <input type="checkbox" name="filter[subgraphDeployment]" checked><div>Deployments</div>
              <input type="checkbox" name="filter[contract]" checked><div>Contracts</div>
              <input type="checkbox" name="filter[contractEvent]" checked><div>Events</div>
            </div>
            <div class='search'>
              <div class='searchbox display-inline-block w-45 vertical-align-top'>
                <input type='text' id='searchbar' class='w-100' placeholder='Ex: Livepeer'>
                <div class='quicksearch bg-offwhite'>
                  <!--<div class='p-025'><b>Search Categories:</b></div>-->
                  <ul class='' style='display:none;' id='searchResults'>
                  </ul>
                </div>
              </div>
              <div id='searchDetail' class='w-50 display-inline-block bg-offwhite p-1 f-75 vertical-align-top'>
                Select a search result option to see more details.
              </div>
              <!--
              <div class='display-inline vertical-align-top'>
                <button>Search</button>
              </div>
              -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class='info w-100 bg-lightgray display-inline-block text-center f-75'>
      <a href='https://github.com/mnlesane/subgraph-contract-lookup' target='_blank'>Github</a> | <a href='https://twitter.com/lesaisne' target='_blank'>Twitter</a> 
    </div>
    <!--
    <div class='table w-100'>
      <div class='row'>
        <div class='col w-100 text-right'>
          <a href='http://twitter.com/lesaisne'><img src='cogrt.png' style='width:35px;'></a>
        </div>
      </div>
    </div>
    -->
  </body>
</html>

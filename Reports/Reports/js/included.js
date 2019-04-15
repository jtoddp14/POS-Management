$(window).load(function ()
{
  // Add call to loadTooltips function defined below for each html that is loaded
  loadTooltips();
});

$(function(){
	$("#includedHeader").load("/header.html");
});

$(function()
{
	$("#includedSidebarMenu").load("/left-menu-tabs/sidebar-menu.html", function()
	{
		var userName = getCookie("user");
		$('#divUserName').html(userName);
		
		$('.hamburger').click(function(){
			if ($('body').hasClass('menu-left-opened')) {
				$(this).removeClass('is-active');
				$('body').removeClass('menu-left-opened');
				$('html').css('overflow','auto');
			} else {
				$(this).addClass('is-active');
				$('body').addClass('menu-left-opened');
				$('html').css('overflow','hidden');
			}
		});
	}); 
});

$(function(){
	$("#includedFooter").load("/footer.html");
});

function getCookie(name)
{
	var pattern = RegExp(name + "=.[^;]*");
	matched = document.cookie.match(pattern);
	if(matched)
	{
			var cookie = matched[0].split('=');
			return cookie[1];
	}
	else
		return false;
}			

function showLoading()
{
	if (document.getElementById("loading") != null)
		document.getElementById("loading").style.display = "inline-block";
}

function hideLoading()
{
	if (document.getElementById("loading") != null)
		document.getElementById("loading").style.display = "none";
}

function loadTooltips()
{
	// For each input field load the tooltip text from tooltips.html file
	var tooltipsContent = document.getElementById("tooltips").contentWindow;
	var elements = document.getElementsByTagName("*")
	for (var i = 0; i < elements.length; i++)
	{
			var tooltipId = elements[i].id;
			var tooltipElement = tooltipsContent.document.getElementById(tooltipId);
			if (tooltipElement != null)
			{
					elements[i].setAttribute("title", tooltipElement.innerHTML);
					elements[i].setAttribute("data-toggle", "tooltip");
					elements[i].setAttribute("data-html", "true");
					elements[i].setAttribute("class", "custom-tooltip");
			}
	}

	$('[data-toggle="tooltip"]').tooltip({placement: 'auto'});
}

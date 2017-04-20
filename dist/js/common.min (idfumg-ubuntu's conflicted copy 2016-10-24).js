$(function(){"use strict";function e(){for(var e in i)i[e].removeClass("active");for(var e in o)o[e].removeClass("active-container");for(var t in s)s[t].removeClass("active-container")}function t(e,t,n){$(e).each(function(){var e=$(this);e.hasClass(t)?e.toggleClass(n):e.removeClass(n)})}function n(){console.log("Setup main menu...");for(var e in i)i[e].click(function(e){return function(){t(".main-menu .button",e,"active"),t(".containers .container",e,"active-container")}}(e))}function r(){console.log("Setup back buttons...");for(var e in o)o[e].find(".back").click(function(e){return function(){i[e].click()}}(e));for(var t in s)s[t].find(".back").click(function(e){return function(){s[e].toggleClass("active-container")}}(t))}window.get_active_server_name=function(){var e=o.servers.find(".server").not(".hidden"),t=null;return e.each(function(){$(this).hasClass("active")&&(t=$(this).find(".name").text())}),t};var i={servers:$(".menu .main-menu .servers")},o={settings:$(".containers .settings"),logs:$(".containers .logs"),servers:$(".containers .servers"),events:$(".containers .events"),main_window:$("#scrollbar1")},s={servers_new:$(".containers .servers-new"),datetime:$(".containers .datetime")};n(),r();var a=new AjaxApi,l=new WSApi({url:"ws://localhost:8888/ws",connected_callback:function(){a.get_servers(u.rebuild),$(".connect-button").addClass("connected"),u.click_active()},disconnected_callback:function(){$(".connect-button").removeClass("connected")},server_logs_append_callback:function(e,t){c.append_ws(e,t)}});l.connect();var c=new MainWindow({main_window:o.main_window,scrollbar:o.main_window,scroll_up_callback:function(e){c.is_search?a.server_search_logs(get_active_server_name(),$(".search-text").val(),e,f.first_date,f.last_date,function(e,t){c.prepend(e,t)}):a.get_servers_logs(get_active_server_name(),e,function(e,t){c.prepend(e,t)})},main_window_click_callback:function(t){e()}}),u=new Servers({servers:o.servers,servers_new:s.servers_new,new_server_callback:function(e,t,n){a.new_server(e,t,n,function(r){u.add_new_server_record(e,t,n,r.id,!1)})},server_name_clicked_callback:function(e){c.clean(),a.get_servers_logs(e,null,function(t,n){c.append(t,n),c.autoscroll=!0,c.is_search=!1,l.subscribe_server_logs(e)})},update_server_callback:function(e,t,n,r){a.update_server(e,t,n,r,function(i){u.update_server(r,e,t,n)})}}),f=new SearchFields({search_fields:$(".search-fields"),search_text_callback:function(e,t,n){""!==e?a.server_search_logs(get_active_server_name(),e,null,t,n,function(e,t){c.clean(),c.is_search=!0,c.append(e,t)}):a.get_servers_logs(get_active_server_name(),null,function(e,t){c.append(e,t),c.autoscroll=!0,c.is_search=!1,l.subscribe_server_logs(get_active_server_name())})},connect_button_connected_callback:function(){l.connect()},connect_button_disconnected_callback:function(){l.disconnect()},calendar_button_clicked_callback:function(){t(".containers .container","datetime","active-container")}})});
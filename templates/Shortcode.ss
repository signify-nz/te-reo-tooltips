<% if $Translation %>
    <span
        class="te-reo-tooltip<% if $Hexcode %> te-reo-tooltip--custom-theme<% else_if $DarkMode %> te-reo-tooltip--dark-theme<% end_if %>"
        data-originaltext="$Content"
        aria-label="The meaning of '$Translation' is '$Content'"
        <% if $Hexcode %>style="---tooltip-customhexcode:$Hexcode"<% end_if %>
    >
    $Translation
    </span>
<% else %>
    $Content
<% end_if %>

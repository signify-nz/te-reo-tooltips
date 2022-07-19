<% if $Translation %>
    <span 
        class="TeReoToolTip<% if $Hexcode %> CustomTheme<% else_if $DarkMode %> DarkTheme<% end_if %>" 
        data-originaltext="$Content" 
        aria-label="The meaning of '$Translation' is '$Content'"  
        <% if $Hexcode %>style="---tooltip-customhexcode:$Hexcode"<% end_if %>
    >
    $Translation
    </span>
<% else %>
    $Content
<% end_if %>
<% if $Translation %>
    <span
        class="TeReoToolTip<% if $Hexcode %> TeReoToolTip--Custom-Theme<% else_if $DarkMode %> TeReoToolTip--Dark-Theme<% end_if %>"
        data-originaltext="$Content"
        aria-label="The meaning of '$Translation' is '$Content'"
        <% if $Hexcode %>style="---tooltip-customhexcode:$Hexcode"<% end_if %>
    >
    $Translation
    </span>
<% else %>
    $Content
<% end_if %>

<template>
    <div id="app">
        <nav class="navbar navbar-expand-lg navbar-dark">
            <router-link to="/" class="navbar-brand">SLMN.GG</router-link>
            <ul class="navbar-nav mr-auto">
                <router-link to="/events" class="nav-link" active-class="active">Events</router-link>
                <router-link to="/teams" class="nav-link" active-class="active">Teams</router-link>
                <router-link to="/players" class="nav-link" active-class="active">Players</router-link>
                <router-link to="/news" class="nav-link" active-class="active">News</router-link>
            </ul>
        </nav>
        <router-view class="mt-3 slmngg-page"/>
    </div>
</template>

<style>

</style>

<template>
  <div>Login</div>
</template>

<script lang="ts">
"use strict";

import router from "@/router";
import { onBeforeMount, defineComponent } from "vue";
import { generateAccessToken } from "@/helper/authHelper";
import { useRoute } from "vue-router";
import { R_NetworkError } from "@/errors/restartError";

export default defineComponent({
  setup() {
    const query = useRoute().query;

    onBeforeMount(() => {
      console.log("Login");

      generateAccessToken({
        state: query["state"] as string,
        code: query["code"] as string,
        error: query["error"] as string
      })
        .then(() => router.push("Manager"))
        .catch((reason: unknown) => {
          throw new R_NetworkError(JSON.stringify(reason));
        });
    });
  }
});
</script>

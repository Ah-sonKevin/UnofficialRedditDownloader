<template>
  <form id="input">
    <el-input
      v-model="urlInput"
      placeholder="Enter item's URL"
      required
      pattern="(((http(s)?:\/\/)?www\.)?reddit\.com\/r\/(\w|\/)+)"
      @input="checkValidity"
    >
      <template #append>
        <el-button type="primary" @click="downloadItem"> Download </el-button>
      </template>
    </el-input>
    <label :class="{ active: !isValid }">Please enter a valid reddit URL</label>
    <input type="submit" />
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { buildContent } from "@/object/contentBuilder";
import { download } from "@/helper/objectDownloader";
import { R_BadLinkError, R_DownloadError } from "@/errors/restartError";
import { rawItem } from "@/helper/rawItemInterface";

export default defineComponent({
  name: "HomeDownloadLink",

  setup() {
    const urlInput = ref("");
    const isValid = ref(true);

    function checkValidity() {
      const element = document.getElementById("input"); //todo put on beforeMount
      if (element) {
        isValid.value = (element as HTMLFormElement).reportValidity();
      }
    }

    function downloadItem() {
      checkValidity();
      if (isValid.value) {
        fetch(urlInput.value + ".json")
          .then(el => {
            if (el.ok) {
              return el.json();
            } else {
              throw new R_BadLinkError("Couldn't access link"); //tocheck
            }
          })
          .then((json: rawItem[]) => {
            const content = json[0].data.children[0];
            return buildContent({ kind: content.kind, data: content.data });
          })
          .then(item => download(item))
          .catch(err => {
            throw new R_DownloadError();
          });
      }
    }

    return {
      checkValidity,
      downloadItem,
      urlInput,
      isValid
    };
  }
});
</script>

<style lang="scss" scoped></style>

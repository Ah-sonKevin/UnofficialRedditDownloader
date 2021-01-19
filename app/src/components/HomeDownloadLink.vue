<template>
  <form id="input">
    <el-input
      v-model="urlInput"
      placeholder="Enter item's URL"
      required
      pattern="(((http(s)?:\/\/)?www\.)?reddit\.com\/r\/(\w|\/)+)"
      @input="checkOnChange"
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
import { R_BadLinkError } from "@/errors/error";
import { R_DownloadError } from "@/errors/errorLight";
import { download } from "@/helper/objectDownloader";

export default defineComponent({
  name: "HomeDownloadLink",

  setup() {
    const urlInput = ref("");
    const isValid = ref(true);

    function checkOnChange() {
      isValid.value = (document.getElementById(
        "input"
      ) as HTMLFormElement).check();
    }

    function downloadItem() {
      isValid.value = (document.getElementById(
        "input"
      ) as HTMLFormElement).reportValidity();
      if (isValid.value) {
        fetch(urlInput.value + ".json")
          .then(el => {
            if (el.ok) {
              return el.json();
            } else {
              throw new R_BadLinkError("Couldn't access link");
            }
          })
          .then(json => {
            const content = json[0].data.children[0];
            return buildContent({ kind: content.kind, data: content.data });
          })
          .then(item => download(item))
          .catch(err => {
            console.log(err); //todo console error
            //todo redo error Management
            throw new R_DownloadError();
          });
      }
    }

    return {
      checkOnChange,
      downloadItem,
      urlInput,
      isValid
    };
  }
});
</script>

<style lang="scss" scoped></style>

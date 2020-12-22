// https://github.com/schovi/create-chrome-extension

function htmlToJSX(html) {
  return (
    html
      // close <input /> and <br /> tags
      .replace(/\<input(.*)>/g, "<input$1 />")
      .replace(/\<br>/g, "<br />")

      // Replace `class=` with `className=`
      .replace(/class=/g, "className=")

      // Replace inline styles with style object
      .replace(/style="([^"]*)"/g, (_, styles) => {
        const regex = /(\s*([\w-]*)\s*:\s*([^;]+))/g;
        const matches = Array.from(styles.matchAll(regex));
        return `style={{${matches
          .map((m) => `${camelCase(m[2])}: "${m[3]}"`)
          .join(",")}}}`;
      })

      // Replace transitions with <Transition> component comment
      .replace(
        /Entering: "(.*)"\n\s*From: "(.*)"\n\s*To: "(.*)"\n\s*Leaving: "(.*)"\n\s*From: "(.*)"\n\s*To: "(.*)"/,
        (_, enter, enterFrom, enterTo, leave, leaveFrom, leaveTo) => {
          return `For animated transitions, import { Transition } from '@headlessui/react' and wrap the next tag in this component:\n<Transition
        show={isOpen}
        enter="${enter}"
        enterFrom="${enterFrom}"
        enterTo="${enterTo}"
        leave="${leave}"
        leaveFrom="${leaveFrom}"
        leaveTo="${leaveTo}"
      ></Transition>`;
        }
      )

      // Replace all attributes starting with @.
      //
      // E.g.: `@click.stop` -> `data-todo-at-stop`
      .replace(
        / @([^"]*)=/g,
        (_all, group) => ` data-todo-at-${group.replace(/[.:]/g, "-")}=`
      )

      // Replaces all attributes starting with x-.
      //
      // E.g.: `x-transition:enter` -> `data-todo-x-transition-enter`
      .replace(
        / x-([^ "]*)/g,
        (_all, group) => ` data-todo-x-${group.replace(/[.:]/g, "-")}`
      )

      // Replace html comments with JSX comments
      // .replace(/(<!--\s*(.*)\s*-->)/g, "{/* $2 */}")
      .replace(/\<!--/g, "{/*")
      .replace(/--\>/g, "*/}")

      // Replace `tabindex="0"` with `tabIndex={0}`
      .replace(/tabindex="([^"]*)"/g, "tabIndex={$1}")

      // Replace `datetime` with `dateTime` for <time />
      .replace(/datetime=/g, "dateTime=")

      // Replace `clip-rule` with `clipRule` in svg's
      .replace(/clip-rule=/g, "clipRule=")

      // Replace `fill-rule` with `fillRule` in svg's
      .replace(/fill-rule=/g, "fillRule=")

      // Replace `stroke-linecap` with `strokeLinecap` in svg's
      .replace(/stroke-linecap=/g, "strokeLinecap=")

      // Replace `stroke-width` with `strokeWidth` in svg's
      .replace(/stroke-width=/g, "strokeWidth=")

      // Replace `stroke-linejoin` with `strokeLinejoin` in svg's
      .replace(/stroke-linejoin=/g, "strokeLinejoin=")

      // Replace `for` with `htmlFor` in forms
      .replace(/for=/g, "htmlFor=")

      // Replace all attributes starting with :.
      //
      // E.g.`:class="{ 'hidden': open, 'inline-flex': !open` ->
      // `data-todo-colon-class="{ 'hidden': open, 'inline-flex': !open }"`
      .replace(/ :(.*)=/g, " data-todo-colon-$1=")

      // Replace `href="#"` with `href="/"` (Otherwise Create React App complains)
      .replace(/href="#"/g, 'href="/"')

      // Replace relative src paths with absolute src paths.
      .replace(/src="\//g, 'src="https://tailwindui.com/')

      // Drop scripts ¯\_(ツ)_/¯
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")

      // Trim the whitespace!
      .trim()
  );
}

var getClosest = function (elem, selector) {
  for (; elem && elem !== document; elem = elem.parentNode) {
    if (elem.matches(selector)) return elem;
  }
  return null;
};

function wrap(jsx) {
  const lines = jsx.split("\n");
  const indented = lines.map((line) => "    " + line).join("\n");
  return `export default function Component(props){\n  return (\n${indented}\n  );\n}`;
}

function main() {
  // console.log("running");
  [...document.querySelectorAll("pre")].forEach((pre) => {
    pre.classList.remove("language-html");
    pre.classList.add("language-jsx");

    const code = pre.querySelector("code");
    code.classList.remove("language-html");
    code.classList.add("language-jsx");

    const codeString = code.innerText;
    const newCodeString = wrap(htmlToJSX(codeString));
    // const newCodeString = "function(){\n  console.log('test');\n}";

    // code.innerText = newCodeString;
    // Prism.highlightElement(code);
    // console.log(newCodeString);
    code.innerHTML = Prism.highlight(newCodeString, Prism.languages.jsx, "jsx");

    const textarea = getClosest(pre, "[id^=component]").querySelector(
      "textarea"
    );
    textarea.value = newCodeString;
  });
  // window.Prism.highlightAll();
}

window.addEventListener("load", main);

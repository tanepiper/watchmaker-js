function t(t, e, n) {
  e = e || 20, n = n || { splitChar: ' ', joinChar: ' ' };
  for (var r = (t || '').split(n.splitChar), o = [], u = '', a = 0; a < r.length; a++) {
    var i = r[a], c = r[a + 1], s = [u = [u, i].join(' ').trim(), c].join(' ');
    c && s.length > e && (o.push('' + u), u = '');
  }
  return u && o.push(u), o;
}

function e(e, n, r, o) {
  n = n || 4;
  for (var u = [], a = t(e, r = r || 18), i = !1; !i;) {
    var c = a.splice(0, n);
    0 === c.length ? i = !0 : u.push(c.join('\n'));
  }
  return u;
}

Object.defineProperty(exports, '__esModule', { value: !0 }), exports.convertStringToPage = e, exports.createCountUp = function(t, e, n) {
  var r, o, u = t / (n = n || 1);
  return {
    start: new Promise((function(t) {
      o = t;
      var a = 1;
      r = setInterval((function() {
        if (a === u) return o(!1), clearInterval(r);
        e(a * n), a++;
      }), 1e3 * n), e(0);
    })), cancel: function() {
      clearInterval(r), o(!0);
    }
  };
}, exports.createCountdown = function(t, e, n) {
  var r, o, u = t / (n = n || 1);
  return {
    start: new Promise((function(a) {
      o = a;
      var i = 1;
      r = setInterval((function() {
        if (i === u) return o(!1), clearInterval(r);
        e(t - i * n), i++;
      }), 1e3 * n), e(t);
    })), cancel: function() {
      clearInterval(r), o(!0);
    }
  };
}, exports.createMenu = function(t, e, n, r, o) {
  E.showMenu();
  var u = { '': { title: t } };
  return e && (u[' '] = { value: e }), Object.keys(n).forEach((function(t) {
    u[t] = n[t];
  })), r && (u.Back = r), o && (u.Exit = o), E.showMenu(u);
}, exports.createSelectPage = function(t, n, r, o, u) {
  return o = o || 0, u || (n = e(n)[0]), E.showPrompt(n, { title: t, buttons: r, selected: o });
}, exports.formatTimestampToDate = function(t) {
  var e = new Date(t);
  return ['' + e.getFullYear(), '' + e.getMonth(), '' + e.getDate()].map((function(t) {
    return t.length < 2 ? '0' + t : '' + t;
  })).join('-');
}, exports.formatTimestampToTime = function(t, e) {
  var n = new Date(t), r = ['' + n.getHours(), '' + n.getMinutes(), '' + n.getSeconds()].map((function(t) {
    return t.length < 2 ? '0' + t : '' + t;
  })).join(':');
  return e ? r : r.substr(0, 5);
}, exports.getFixedStringLines = t, exports.lug = function(t, e, n) {
  var r = {
    goTo: function(n) {
      for (var r = [], o = 1; o < arguments.length; o++) r[o - 1] = arguments[o];
      e(n), t[n] ? t[n].view(r) : E.showAlert('Route ' + n + ' not found').then((function() {
        return t.home.view();
      }));
    }
  };
  return n(r), r;
};

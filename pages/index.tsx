import { useEffect, useRef, useState } from 'react';
import {
  parseBigIntArray,
  bigIntToDigits,
  formatToLFormat,
  formatEncrypted,
  modPow,
} from '../lib/bigint';

// 默认值（BigInt 字符串）
const DEFAULT_E = BigInt("65537");
const DEFAULT_N = BigInt("16864325190094293761");
const DEFAULT_D = BigInt("869759359060353473");

export default function Home() {
  const [e, setE] = useState<string>('');
  const [d, setD] = useState<string>('');
  const [n, setN] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [decisionValue, setDecisionValue] = useState<bigint | null>(null);

  const hasRun = useRef(false);

  useEffect(() => {
    const loadDefaults = () => {
      const saved = localStorage.getItem('rsa-keys');
      const defaults = {
        e: formatToLFormat(bigIntToDigits(DEFAULT_E)),
        d: formatToLFormat(bigIntToDigits(DEFAULT_D)),
        n: formatToLFormat(bigIntToDigits(DEFAULT_N)),
      };

      if (saved) {
        const parsed = JSON.parse(saved);
        setE(parsed.e);
        setD(parsed.d);
        setN(parsed.n);
      } else {
        setE(defaults.e);
        setD(defaults.d);
        setN(defaults.n);
      }
    };

    loadDefaults();
  }, []);

  useEffect(() => {
    if (hasRun.current) return;

    if (e && d && n) {
      hasRun.current = true;
    } else {
      return;
    }

    // 检查 URL 参数 ?verify=...
    const params = new URLSearchParams(window.location.search);
    const verify = params.get('verify');
    if (verify) {
      try {
        const encryptedValue = parseBigIntArray(verify);
        const nVal = parseBigIntArray(n);
        const dVal = parseBigIntArray(d);

        console.log(encryptedValue, nVal, dVal)

        // 解密：value = encrypted^d mod n
        const decrypted = modPow(encryptedValue, dVal, nVal);
        setDecisionValue(decrypted);
        setShowModal(true);

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('verify');
        window.history.replaceState({}, '', newUrl);
      } catch (err) {
        console.log(err);
        setOutput('错误：无法解析 verify 参数，请检查格式。');
      }
    }
  }, [n, d]);

  const saveKeys = () => {
    localStorage.setItem(
      'rsa-keys',
      JSON.stringify({ e, d, n })
    );
    alert('密钥已保存到本地！');
  };

  const resetKeys = () => {
    const defaults = {
      e: formatToLFormat(bigIntToDigits(DEFAULT_E)),
      d: formatToLFormat(bigIntToDigits(DEFAULT_D)),
      n: formatToLFormat(bigIntToDigits(DEFAULT_N)),
    };
    setE(defaults.e);
    setD(defaults.d);
    setN(defaults.n);
    localStorage.removeItem('rsa-keys');
    setOutput('');
  };

  const handleDecision = (grant: boolean) => {
    if (!decisionValue) return;
    let response = '';
    if (grant) {
      // 解密值 +1
      const newValue = decisionValue + BigInt("1");
      const nVal = parseBigIntArray(n);
      const dVal = parseBigIntArray(d);
      // 用私钥加密：newValue^d mod n
      const encryptedNew = modPow(newValue, dVal, nVal);
      const resultArray = bigIntToDigits(encryptedNew);
      response = formatEncrypted(resultArray); // → %[1,2,3]%
    } else {
      response = '授权已拒绝。';
    }
    setOutput(response);
    setShowModal(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to Yopo!</h1>

      <div style={{ marginBottom: '15px' }}>
        <label>
          e (公钥指数):<br />
          <input
            type="text"
            value={e}
            onChange={(e) => setE(e.target.value)}
            placeholder="1L6L5L5L3L7L"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>
          d (私钥指数):<br />
          <input
            type="text"
            value={d}
            onChange={(e) => setD(e.target.value)}
            placeholder="2L1L7L8L..."
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>
          n (模数):<br />
          <input
            type="text"
            value={n}
            onChange={(e) => setN(e.target.value)}
            placeholder="6L4L2L..."
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={saveKeys}
          style={{ marginRight: '10px', padding: '8px 12px' }}
        >
          保存密钥
        </button>
        <button
          onClick={resetKeys}
          style={{ padding: '8px 12px' }}
        >
          重置为默认
        </button>
      </div>

      {output && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f4f4f4',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            wordBreak: 'break-all',
          }}
        >
          <strong>结果：</strong>
          <code
            style={{
              display: 'inline-block',
              marginTop: '8px',
              background: '#eee',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            {output}
          </code>
        </div>
      )}

      {/* 授权弹窗 */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0' }}>权限请求</h3>
            <p style={{ margin: '0 0 16px 0' }}>
              <strong>解密数据：</strong>
              <span style={{ fontFamily: 'monospace' }}>
                {decisionValue?.toString()}
              </span>
            </p>
            <p style={{ margin: '0 0 20px 0' }}>
              假设你是服务端，你要不要给玩家权限？
            </p>
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => handleDecision(false)}
                style={{
                  marginRight: '12px',
                  padding: '8px 16px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                拒绝
              </button>
              <button
                onClick={() => handleDecision(true)}
                style={{
                  padding: '8px 16px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                授予
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
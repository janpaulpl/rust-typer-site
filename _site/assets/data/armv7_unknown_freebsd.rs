use crate::spec::{Target, TargetOptions, base};

pub(crate) fn target() -> Target {
    Target {
        llvm_target: "armv7-unknown-freebsd-gnueabihf".into(),
        metadata: crate::spec::TargetMetadata {
            description: Some("Armv7-A FreeBSD".into()),
            tier: Some(3),
            host_tools: Some(true),
            std: Some(true),
        },
        pointer_width: 32,
        data_layout: "e-m:e-p:32:32-Fi8-i64:64-v128:64:128-a:0:32-n32-S64".into(),
        arch: "arm".into(),
        options: TargetOptions {
            abi: "eabihf".into(),
            env: "gnu".into(),
            features: "+v7,+vfp3,-d32,+thumb2,-neon".into(),
            max_atomic_width: Some(64),
            mcount: "\u{1}__gnu_mcount_nc".into(),
            ..base::freebsd::opts()
        },
    }
}
